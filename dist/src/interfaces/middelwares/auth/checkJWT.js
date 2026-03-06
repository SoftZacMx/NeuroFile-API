"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkJWT = void 0;
const TokenServiceImpl_1 = require("../../../infrastructure/services/TokenServiceImpl");
const tokenService = new TokenServiceImpl_1.TokenService();
const checkJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        res.status(401).json({ message: 'Invalid token format' });
        return;
    }
    try {
        const payload = tokenService.verify(token);
        if (!payload) {
            res.status(401).json({ message: 'Invalid or expired token' });
            return;
        }
        req.user = payload;
        next(); // ✅ termina con next
    }
    catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
exports.checkJWT = checkJWT;
