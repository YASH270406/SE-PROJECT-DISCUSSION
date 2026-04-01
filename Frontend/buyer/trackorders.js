// KisanSetu | Track Orders — Supabase Live Data
// SRS FR-3.3, FR-3.4, FR-7.2
import { supabase } from '../supabase-config.js';

// ─── Status pipeline (mirrors transaction_ledger.status + order lifecycle) ────
// transaction_ledger statuses: Escrow_Held → Settled | Refunded
// We map a display-friendly pipeline from the bid/produce data
const STATUS_STAGES = ['Placed', 'Confirmed', 'InTransit', 'Delivered', 'Settled'];

let currentBuyerId = null;

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await supabase.auth.getSession().then(r => ({ data: { user: r.data?.session?.user ?? null } }));
    
    // Fallback: use getUser()
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
        window.location.href = '../index.html';
        return;
    }

    currentBuyerId = authUser.id;
    await loadOrders('active');

    // Realtime subscription: refresh if new transaction comes in
    supabase
        .channel('buyer-orders')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'transaction_ledger',
            filter: `from_user_id=eq.${currentBuyerId}`
        }, () => {
            const activeTab = document.getElementById('tabActive').classList.contains('active') ? 'active' : 'past';
            loadOrders(activeTab);
        })
        .subscribe();
});

// ─── Tab switching ─────────────────────────────────────────────────────────────
function switchTab(tab) {
    document.getElementById('tabActive').classList.toggle('active', tab === 'active');
    document.getElementById('tabPast').classList.toggle('active', tab === 'past');
    document.getElementById('activeOrdersList').style.display = tab === 'active' ? 'block' : 'none';
    document.getElementById('pastOrdersList').style.display = tab === 'past' ? 'block' : 'none';
    loadOrders(tab);
}
window.switchTab = switchTab;

// ─── Load orders from Supabase ────────────────────────────────────────────────
async function loadOrders(tab) {
    const container = document.getElementById(tab === 'active' ? 'activeOrdersList' : 'pastOrdersList');
    container.innerHTML = '<p style="text-align:center;padding:30px;color:#888;"><i class="fa-solid fa-spinner fa-spin"></i> Loading your orders...</p>';

    if (!currentBuyerId) return;

    // Fetch transactions for this buyer (Produce_Sale type)
    const { data: transactions, error } = await supabase
        .from('transaction_ledger')
        .select(`
            id,
            amount,
            status,
            created_at,
            reference_id,
            produce (
                id,
                crop_name,
                variety,
                quantity,
                unit,
                price,
                images,
                farmer_id,
                users!produce_farmer_id_fkey (
                    full_name,
                    mobile_num
                )
            )
        `)
        .eq('from_user_id', currentBuyerId)
        .eq('reference_type', 'Produce_Sale')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch error:', error);
        container.innerHTML = '<div class="card"><p style="color:#c62828;">⚠️ Could not load orders. Please try again.</p></div>';
        return;
    }

    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<div class="card" style="text-align:center;padding:30px;"><i class="fa-solid fa-box-open" style="font-size:2rem;color:#ccc;margin-bottom:10px;display:block;"></i><p style="color:#999;">No orders found.</p><a href="browse_produce.html" style="color:#2e7d32;font-weight:600;">Browse Produce →</a></div>';
        return;
    }

    // Filter by tab
    const activeStatuses = ['Escrow_Held'];
    const pastStatuses = ['Settled', 'Refunded'];

    const filtered = transactions.filter(t =>
        tab === 'active' ? activeStatuses.includes(t.status) : pastStatuses.includes(t.status)
    );

    if (filtered.length === 0) {
        const msg = tab === 'active' ? 'No active deliveries right now.' : 'No past orders yet.';
        container.innerHTML = `<div class="card" style="text-align:center;padding:30px;"><i class="fa-solid fa-check-circle" style="font-size:2rem;color:#ccc;margin-bottom:10px;display:block;"></i><p style="color:#999;">${msg}</p></div>`;
        return;
    }

    container.innerHTML = '';
    filtered.forEach(txn => renderOrderCard(txn, container, tab));
}

// ─── Map ledger status → display pipeline stage ────────────────────────────
function getDisplayStatus(ledgerStatus) {
    switch (ledgerStatus) {
        case 'Escrow_Held': return 'InTransit'; // Funds held = in transit
        case 'Settled':     return 'Settled';
        case 'Refunded':    return 'Cancelled';
        default:            return 'Placed';
    }
}

// ─── Render a single order card ────────────────────────────────────────────
function renderOrderCard(txn, container, tab) {
    const produce = txn.produce;
    const farmer = produce?.users;
    const displayStatus = getDisplayStatus(txn.status);
    const currentStageIdx = STATUS_STAGES.indexOf(displayStatus);
    const isDelivered = displayStatus === 'Delivered';
    const isSettled = displayStatus === 'Settled';
    const isCancelled = displayStatus === 'Cancelled';
    const orderDate = new Date(txn.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const shortId = txn.id.substring(0, 8).toUpperCase();
    const cropName = produce ? `${produce.crop_name}${produce.variety ? ' (' + produce.variety + ')' : ''}` : 'Unknown Crop';
    const qty = produce ? `${produce.quantity} ${produce.unit || 'Kg'}` : '—';
    const farmerName = farmer ? farmer.full_name : 'Unknown Farmer';

    // Build timeline HTML
    let timelineHTML = '';
    if (isCancelled) {
        timelineHTML = `
            <div style="background:rgba(211,47,47,0.08);border-left:5px solid #d32f2f;padding:15px;border-radius:8px;margin-bottom:20px;">
                <strong style="color:#d32f2f;"><i class="fa-solid fa-ban"></i> Order Cancelled / Refunded</strong>
                <p style="margin:5px 0 0;color:#555;font-size:0.9rem;">Funds have been refunded to your account.</p>
            </div>`;
    } else {
        timelineHTML = '<ul class="timeline">';
        STATUS_STAGES.forEach((stage, i) => {
            let liClass = 'timeline-step';
            if (i < currentStageIdx || (i === currentStageIdx && isSettled)) liClass += ' completed';
            if (i === currentStageIdx && !isSettled) liClass += ' active';

            let label = stage;
            if (stage === 'Settled') label = 'Payment Settled (Escrow Released)';
            if (stage === 'InTransit') label = 'In Transit';

            timelineHTML += `<li class="${liClass}"><div class="step-dot"></div><span class="step-text">${label}</span></li>`;
        });
        timelineHTML += '</ul>';
    }

    const card = document.createElement('div');
    card.className = 'card glass-card';
    card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid rgba(46,125,50,0.1);padding-bottom:15px;margin-bottom:20px;">
            <div>
                <strong style="font-size:1.25rem;color:var(--primary-green);">${cropName}</strong>
                <div style="color:var(--soil-brown);font-size:0.9rem;margin-top:5px;">
                    TXN-${shortId} &bull; ${qty} &bull; ${orderDate}
                </div>
                <div style="color:#666;font-size:0.85rem;margin-top:3px;">
                    <i class="fa-solid fa-user"></i> Farmer: ${farmerName}
                </div>
            </div>
            <div style="font-size:1.4rem;font-weight:700;color:var(--charcoal);">₹${Number(txn.amount).toLocaleString('en-IN')}</div>
        </div>

        <div style="margin-bottom:10px;">
            <span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:0.8rem;font-weight:600;
                background:${txn.status==='Escrow_Held'?'#fff3e0':txn.status==='Settled'?'#e8f5e9':'#fce4ec'};
                color:${txn.status==='Escrow_Held'?'#e65100':txn.status==='Settled'?'#2e7d32':'#c62828'};">
                ${txn.status === 'Escrow_Held' ? '🔒 Funds in Escrow' : txn.status === 'Settled' ? '✅ Payment Settled' : '↩️ Refunded'}
            </span>
        </div>

        ${timelineHTML}

        <div style="margin-top:20px;display:flex;gap:12px;flex-direction:column;">
            ${isDelivered || txn.status === 'Escrow_Held' ? `<button class="btn-primary" onclick="confirmQuality('${txn.id}')"><i class="fa-solid fa-check-circle"></i> Confirm Receipt (Release Funds)</button>` : ''}
            ${!isCancelled && txn.status !== 'Settled' ? `<button class="btn-primary" style="background:#fff;color:#d32f2f;border:1px solid #d32f2f;box-shadow:none;" onclick="raiseIssue('TXN-${shortId}')"><i class="fa-solid fa-flag"></i> Raise an Issue</button>` : ''}
            <button class="btn-primary btn-secondary" onclick="downloadInvoice('${txn.id}', '${cropName}', '${qty}', ${txn.amount}, '${orderDate}', '${farmerName}')"><i class="fa-solid fa-file-invoice"></i> Download Invoice</button>
        </div>
    `;
    container.appendChild(card);
}

// ─── Confirm Receipt → Release Escrow ─────────────────────────────────────
async function confirmQuality(transactionId) {
    if (!confirm('Confirming receipt will release escrow funds to the farmer. Proceed?')) return;

    const { error } = await supabase
        .from('transaction_ledger')
        .update({ status: 'Settled' })
        .eq('id', transactionId)
        .eq('from_user_id', currentBuyerId); // Security: only buyer can settle

    if (error) {
        alert('Failed to release funds. Please try again.');
        console.error(error);
        return;
    }

    alert('✅ Funds released! Payment settled successfully.');
    loadOrders('active');
    loadOrders('past');
}
window.confirmQuality = confirmQuality;

// ─── Raise Issue Modal ────────────────────────────────────────────────────
function raiseIssue(orderId) {
    document.getElementById('issueOrderId').innerText = orderId;
    document.getElementById('issueModalOverlay').style.display = 'flex';
}
window.raiseIssue = raiseIssue;

function closeIssueModal() {
    document.getElementById('issueModalOverlay').style.display = 'none';
}
window.closeIssueModal = closeIssueModal;

// ─── Download Invoice ──────────────────────────────────────────────────────
function downloadInvoice(txnId, cropName, qty, amount, date, farmerName) {
    const shortId = txnId.substring(0, 8).toUpperCase();
    const invoiceHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>KisanSetu Invoice - TXN-${shortId}</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f0f4f8; padding: 40px; color: #333; }
        .invoice-box { max-width: 800px; margin: auto; padding: 40px; border: 1px solid #e1e8ed; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border-radius: 12px; }
        .header { display: flex; justify-content: space-between; border-bottom: 3px solid #2e7d32; padding-bottom: 25px; margin-bottom: 30px; }
        .header h1 { color: #2e7d32; margin: 0; font-size: 2.2rem; }
        th, td { padding: 15px; text-align: left; border-bottom: 1px solid #e1e8ed; }
        th { background-color: #f1f8e9; color: #2e7d32; font-weight: 600; text-transform: uppercase; font-size: 0.85rem; }
        .total-row td { font-size: 1.2rem; font-weight: bold; color: #1b5e20; background-color: #f1f8e9; border-top: 2px solid #2e7d32; }
        .footer { text-align: center; margin-top: 50px; color: #777; font-size: 0.9rem; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>
<div class="invoice-box">
    <div class="header">
        <div>
            <h1>KisanSetu</h1>
            <p style="margin:5px 0;color:#666;">National Agricultural Trading Platform</p>
        </div>
        <div style="text-align:right;">
            <h2 style="margin:0;color:#555;letter-spacing:2px;">INVOICE</h2>
            <p style="margin:5px 0;"><strong>Date:</strong> ${date}</p>
            <p style="margin:5px 0;"><strong>Transaction ID:</strong> TXN-${shortId}</p>
        </div>
    </div>
    <table width="100%" style="border-collapse:collapse;">
        <tr><th>Commodity</th><th>Quantity</th><th>Farmer</th><th style="text-align:right;">Amount</th></tr>
        <tr>
            <td><strong>${cropName}</strong></td>
            <td>${qty}</td>
            <td>${farmerName}</td>
            <td style="text-align:right;">₹${Number(amount).toLocaleString('en-IN')}</td>
        </tr>
        <tr class="total-row">
            <td colspan="3" style="text-align:right;">Grand Total (Paid via Escrow):</td>
            <td style="text-align:right;">₹${Number(amount).toLocaleString('en-IN')}</td>
        </tr>
    </table>
    <div class="footer">
        <p>Thank you for trading on KisanSetu!</p>
        <p><small>This is a system-generated electronic invoice.</small></p>
    </div>
</div>
</body>
</html>`;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Invoice_TXN-${shortId}.html`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
}
window.downloadInvoice = downloadInvoice;
