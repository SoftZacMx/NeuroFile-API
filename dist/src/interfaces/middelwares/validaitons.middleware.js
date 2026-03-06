"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidatons = void 0;
const express_validator_1 = require("express-validator");
const handleValidatons = (req, res, next) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        return next();
    }
    catch (err) {
        res.status(400);
        res.send({ errors: err.array() });
    }
};
exports.handleValidatons = handleValidatons;
