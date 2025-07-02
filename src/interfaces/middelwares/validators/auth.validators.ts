import { NextFunction, Request, Response } from "express";
import { check, param, query } from 'express-validator';
import { handleValidatons } from "../validaitons.middleware";

//Valipassword data to authentication
const loginValidator = [
    check('email')
        .exists().withMessage('The email is required.')
        .notEmpty().withMessage('The email cannot be empty.')
        .isEmail().withMessage('The email must be a email.'),
            (req:Request,res:Response,next:NextFunction) => {
        handleValidatons(req,res,next)

    },
    check('password')
        .exists().withMessage('The password is required.')
        .notEmpty().withMessage('The password cannot be empty.')
        .isString().withMessage('The password must be a string.'),
            (req:Request,res:Response,next:NextFunction) => {
        handleValidatons(req,res,next)

    }
        
];



export {
    loginValidator
};
