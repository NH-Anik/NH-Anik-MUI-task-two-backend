import  express from "express";
import {registerController,verifyEmailController,loginController,forgotPasswordController,forgotOtpPasswordController,testController,updateProfileController,getAllUser,
    deleteUser,updateUser,updateProfilePicController
} from "../controller/authController.js";
import { requestSignIn,isAdmin } from "../middleware/authMiddleware.js";
import update   from "../middleware/multer.js";

const router = express.Router();

// routing
// register || method post
router.post("/register",registerController)

// verify email
router.post("/verify-email", verifyEmailController);

// login || method post
router.post("/login", loginController)

// forgot || method post
router.post("/forgot-password", forgotPasswordController)
router.post("/forgot-passwordOtp", forgotOtpPasswordController)

// test middleware || method post
router.get("/test",requestSignIn,isAdmin , testController)

// protected user route auth
router.get("/user-auth",requestSignIn,(req,res)=>{
    res.send({ok:true})
})

// protected admin route auth
router.get("/admin-auth",requestSignIn,isAdmin,(req,res)=>{
    res.send({ok:true})
})

//update profile
router.put("/profile", requestSignIn, updateProfileController);

// all user show
router.get("/all-user",requestSignIn,isAdmin, getAllUser);
// user delete 
router.delete("/delete-user/:id",requestSignIn,isAdmin, deleteUser);

//create  user update
router.put("/update-user/:id",requestSignIn,isAdmin, updateUser);

// update profile pic
router.put("/profile-pic/:id", requestSignIn, update.single("image"),updateProfilePicController)

export default router