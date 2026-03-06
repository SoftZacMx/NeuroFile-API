"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidator = void 0;
const express_validator_1 = require("express-validator");
const validaitons_middleware_1 = require("../validaitons.middleware");
//Valipassword data to authentication
const loginValidator = [
    (0, express_validator_1.check)('email')
        .exists().withMessage('The email is required.')
        .notEmpty().withMessage('The email cannot be empty.')
        .isEmail().withMessage('The email must be a email.'),
    (req, res, next) => {
        (0, validaitons_middleware_1.handleValidatons)(req, res, next);
    },
    (0, express_validator_1.check)('password')
        .exists().withMessage('The password is required.')
        .notEmpty().withMessage('The password cannot be empty.')
        .isString().withMessage('The password must be a string.'),
    (req, res, next) => {
        (0, validaitons_middleware_1.handleValidatons)(req, res, next);
    }
];
exports.loginValidator = loginValidator;
