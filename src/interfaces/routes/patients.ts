import { Router } from "express";
const router = Router();
import { checkJWT } from "../middelwares/auth/checkJWT";
import { TokenService } from "../../infrastructure/services/TokenServiceImpl";
import { createPatientController, deletePatientController, getPatientsController, updatePatientController } from "../controllers/patients.controller";





router.post("/",checkJWT,createPatientController);
router.put("/:user_id",checkJWT,updatePatientController);
router.get("/",checkJWT,getPatientsController);
router.delete("/:user_id",checkJWT,deletePatientController);
router.get("/:user_id",checkJWT,getPatientsController);

/*

*/



export {router};