import { Router } from "express";
const router = Router();
import { checkJWT } from "../middelwares/auth/checkJWT";
import { TokenService } from "../../infrastructure/services/TokenServiceImpl";
import { createPatientController, deletePatientController, getPatientsController, getPatientController, updatePatientController } from "../controllers/patients.controller";





router.post("/",checkJWT,createPatientController);
router.put("/:user_id",checkJWT,updatePatientController);
router.get("/", checkJWT, getPatientsController);
router.get("/:user_id", checkJWT, getPatientController);
router.delete("/:user_id", checkJWT, deletePatientController);

/*

*/



export {router};