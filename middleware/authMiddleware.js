const supabase = require('../config/supabase');

/**
 * Middleware to verify Supabase User JWT
 * Satisfies NFR-5.3 (Security & Authentication)
 */
const verifySupabaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ success: false, message: 'Invalid or expired session.' });
        }

        // Attach user info to the request for controller access
        req.user = user;
        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err);
        res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
    }
};

module.exports = verifySupabaseToken;
