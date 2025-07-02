import { sign,verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "token";

const generateToken =  (id:string,forResetPassword?:boolean) => {

    let jwt:string = ''

    if (forResetPassword) {
        jwt =  sign({id},JWT_SECRET,{expiresIn: "2m"});
    }else{
        jwt =  sign({id},JWT_SECRET,{expiresIn: "8h"});
    }
    return jwt;
}

const verifyToken =  (jwt:string) => {
    const isOk = verify(jwt,JWT_SECRET);
    return isOk;
}

export {generateToken,verifyToken};