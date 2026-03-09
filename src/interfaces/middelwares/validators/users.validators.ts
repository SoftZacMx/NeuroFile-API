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
    check('first_name')
        .exists().withMessage('first_name es requerido.')
        .notEmpty().withMessage('first_name no puede estar vacío.')
        .isString().withMessage('first_name debe ser un string.'),
    check('last_name')
        .exists().withMessage('last_name es requerido.')
        .notEmpty().withMessage('last_name no puede estar vacío.')
        .isString().withMessage('last_name debe ser un string.'),
    check('middle_last_name').optional().trim().isString(),
    check('phone').exists().withMessage('phone es requerido.').notEmpty().trim().isString(),
    check('is_active').optional().isBoolean(),
    check('role')
        .exists().withMessage('El rol es requerido.')
        .notEmpty().withMessage('El rol no puede estar vacío.')
        .isIn(['admin', 'therapist'])
        .withMessage('El rol debe ser admin o therapist'),
            (req:Request,res:Response,next:NextFunction) => {
        handleValidatons(req,res,next)

    }
];



export {
    createUserValidator
};
