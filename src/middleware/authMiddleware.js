import Jwt  from "jsonwebtoken";
import userModel from "../models/userModel.js";
// protected route token base
export const requestSignIn = async (req, res, next) => {
  try {
    const decoded = Jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    req.user=decoded;
    next();
  } catch (error) {
    next(error);
  }
}

// admin route token base
export const isAdmin=async(req,res,next)=>{
  try {
    const user= await userModel.findById(req.user._id);

    if(user.role !== 1){
      return res.status(401).send({
        success: false,
        message: "UnAuthorized access to admin routes",
      });
    }else{
      next();  
    }
    
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in admin middleware",
      error: error.message,
    })
  }
}