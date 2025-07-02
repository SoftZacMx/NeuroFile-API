import { NextFunction, Request,Response } from "express";
import { validationResult} from 'express-validator';

const handleValidatons = (req:Request,res:Response,next:NextFunction) => {
    try {
        validationResult(req).throw()
        return next()
    } catch (err:any) {
        res.status(400)
        res.send({errors: err.array()})
        
    }


    
}

export {handleValidatons};