// controllers/equipmentController.js
const supabase = require('../config/supabase');

// Get all available equipment
const getAllEquipment = async (req, res) => {
    try {
        const { data: equipment, error } = await supabase
            .from('equipment')
            .select('*')
            .eq('status', 'Available');

        if (error) throw error;

        res.status(200).json({ success: true, data: equipment });
    } catch (error) {
        console.error("Supabase Error fetching equipment:", error);
        res.status(500).json({ success: false, message: 'Server Error fetching equipment' });
    }
};

// Create a new booking
const createBooking = async (req, res) => {
    const { equipmentId, startDate, endDate, totalCost } = req.body;
    const farmerId = req.user.id; // From authMiddleware

    try {
        // 1. Check for overlapping bookings (FR-4.4)
        const { data: overlaps, error: overlapError } = await supabase
            .from('bookings')
            .select('*')
            .eq('equipment_id', equipmentId)
            .eq('status', 'Approved')
            .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`);

        if (overlapError) throw overlapError;

        if (overlaps && overlaps.length > 0) {
            return res.status(400).json({ success: false, message: 'Equipment is already booked for these dates.' });
        }

        // 2. Create the booking entry in Supabase 'bookings' table
        const { error: dbError } = await supabase
            .from('bookings')
            .insert([
                {
                    equipment_id: equipmentId,
                    farmer_id: farmerId,
                    start_date: startDate,
                    end_date: endDate,
                    total_cost: totalCost,
                    status: 'Pending'
                }
            ]);

        if (dbError) throw dbError;

        res.status(201).json({ success: true, message: 'Booking request sent to owner!' });

    } catch (error) {
        console.error("Supabase Error during booking:", error);
        res.status(500).json({ success: false, message: 'Failed to create booking' });
    }
};

// Get bookings for the current user
const getMyBookings = async (req, res) => {
    const farmerId = req.user.id;

    try {
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
                *,
                equipment:equipment_id (name, type, hourly_rate)
            `)
            .eq('farmer_id', farmerId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        console.error("Supabase Error fetching bookings:", error);
        res.status(500).json({ success: false, message: 'Server Error fetching bookings' });
    }
};

module.exports = { getAllEquipment, createBooking, getMyBookings };