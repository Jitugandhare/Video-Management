const jwt = require('jsonwebtoken');
const dotenv=require('dotenv');
dotenv.config();

exports.authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        // console.log(token)

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token missing' });
        }

        // console.log('Received Token:', token); // Debugging

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        req.user = { _id: decoded.id }; // Assign decoded user ID to request

        // console.log('Decoded Token:', decoded); // Debugging

        next();
    } catch (error) {
        return res.status(403).json({ message: 'Unauthorized: Invalid token' });
    }
};
