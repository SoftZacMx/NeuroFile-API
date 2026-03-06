"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserValidator = void 0;
const express_validator_1 = require("express-validator");
const validaitons_middleware_1 = require("../validaitons.middleware");
//Valipassword data to authentication
const createUserValidator = [
    (0, express_validator_1.check)('email')
        .exists().withMessage('The email is required.')
        .notEmpty().withMessage('The email cannot be empty.')
        .isEmail().withMessage('The email must be a email.'),
    (0, express_validator_1.check)('password')
        .exists().withMessage('The password is required.')
        .notEmpty().withMessage('The password cannot be empty.')
        .isString().withMessage('The password must be a string.'),
    (0, express_validator_1.check)('name')
        .exists().withMessage('The password is required.')
        .notEmpty().withMessage('The password cannot be empty.')
        .isString().withMessage('The password must be a string.'),
    (0, express_validator_1.check)('last_name')
        .exists().withMessage('The password is required.')
        .notEmpty().withMessage('The password cannot be empty.')
        .isString().withMessage('The password must be a string.'),
    (0, express_validator_1.check)('second_last_name')
        .exists().withMessage('The password is required.')
        .notEmpty().withMessage('The password cannot be empty.')
        .isString().withMessage('The password must be a string.'),
    (0, express_validator_1.check)('role')
        .exists().withMessage('The password is required.')
        .notEmpty().withMessage('The password cannot be empty.')
        .isString().withMessage('The password must be a string.'),
    (req, res, next) => {
        (0, validaitons_middleware_1.handleValidatons)(req, res, next);
    }
];
exports.createUserValidator = createUserValidator;
