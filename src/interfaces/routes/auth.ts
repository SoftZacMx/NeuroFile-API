import { Router } from "express";
import { loginValidator } from "../middelwares/validators/auth.validators";
import { loginController, verifyUserController } from "../controllers/auth.controllers";
const router = Router();

/*
    EXAMPPLE-MIDDELWARE
    router.get("/" , checkJWT ,getExpedientes);
*/

router.post("/login",loginController);
router.post("/verify-user",verifyUserController);





export {router};