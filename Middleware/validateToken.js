const jwt = require('jsonwebtoken')
const { StatusCodes } = require('http-status-codes')

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        console.log("No token provided");
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    } 

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token decoded successfully:", decoded);
        req.user = decoded;
        next();
    } catch {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid' })
    }
};