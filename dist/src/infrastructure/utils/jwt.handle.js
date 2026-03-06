"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "token";
const generateToken = (id, forResetPassword) => {
    let jwt = '';
    if (forResetPassword) {
        jwt = (0, jsonwebtoken_1.sign)({ id }, JWT_SECRET, { expiresIn: "2m" });
    }
    else {
        jwt = (0, jsonwebtoken_1.sign)({ id }, JWT_SECRET, { expiresIn: "8h" });
    }
    return jwt;
};
exports.generateToken = generateToken;
const verifyToken = (jwt) => {
    const isOk = (0, jsonwebtoken_1.verify)(jwt, JWT_SECRET);
    return isOk;
};
exports.verifyToken = verifyToken;
