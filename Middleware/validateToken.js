const jwt = require('jsonwebtoken')
const { StatusCodes } = require('http-status-codes')

module.exports = (req, res, next) => {
    // Log the raw Authorization header for debugging
    console.log("Authorization header:", req.headers.authorization);
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        console.log("No token provided");
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    } 

    try {
        // Log the secret in dev (not in production)
        if (process.env.NODE_ENV !== 'production') {
            console.log("JWT_SECRET (dev only):", process.env.JWT_SECRET);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token decoded successfully:", decoded);
        req.user = decoded;
        next();
    } catch {
        console.error("JWT verification error:", err.message); // Log the error message
        res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid' })
    }
};