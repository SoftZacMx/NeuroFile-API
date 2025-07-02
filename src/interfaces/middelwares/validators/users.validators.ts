import { NextFunction, Request, Response } from "express";
import { check, param, query } from 'express-validator';
import { handleValidatons } from "../validaitons.middleware";

//Valipassword data to authentication
const createUserValidator = [
    check('email')
        .exists().withMessage('The email is required.')
        .notEmpty().withMessage('The email cannot be empty.')
        .isEmail().withMessage('The email must be a email.'),
    check('password')
        .exists().withMessage('The password is required.')
        .notEmpty().withMessage('The password cannot be empty.')
        .isString().withMessage('The password must be a string.'),
    check('name')
        .exists().withMessage('The password is required.')
        .notEmpty().withMessage('The password cannot be empty.')
        .isString().withMessage('The password must be a string.'),
    check('last_name')
        .exists().withMessage('The password is required.')
        .notEmpty().withMessage('The password cannot be empty.')
        .isString().withMessage('The password must be a string.'),
    check('second_last_name')
        .exists().withMessage('The password is required.')
        .notEmpty().withMessage('The password cannot be empty.')
        .isString().withMessage('The password must be a string.'),
    check('role')
        .exists().withMessage('The password is required.')
        .notEmpty().withMessage('The password cannot be empty.')
        .isString().withMessage('The password must be a string.'),
            (req:Request,res:Response,next:NextFunction) => {
        handleValidatons(req,res,next)

    }
];



export {
    createUserValidator
};
