import { hash,compare } from "bcryptjs"

const encrypt = async (passPlane:string) => {
    console.log('encrypt passPlane',passPlane);
    
    const passwordHash = await hash(passPlane,8);
    return passwordHash;


}


const verify = async (passPlane:string,passHash:string) => {
    const isCorrect = await compare(passPlane,passHash);
    return isCorrect;
}




export {encrypt,verify}