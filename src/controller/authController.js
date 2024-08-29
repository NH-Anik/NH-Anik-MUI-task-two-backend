// userModel schema import
import userModel from "../models/userModel.js"; 
import { hashPassword,comparePassword } from '../helper/authHelper.js';
import Jwt  from "jsonwebtoken";
import dotenv from 'dotenv'
import sendVerificationEmail from '../services/mailer.js';
import sendVerificationOTP from '../services/emailService.js';

// config dotenv 
dotenv.config()

    
// register post request controller
export const registerController = async (req,res) => {
  try {
    const {name,email,password,country,phone}=req.body;
    // validation
    if(!name){
      return res.send({message:"Name is Required"})
    }
    if(!email){
      return res.send({message:"Email is Required"})
    }
    if(!password){
      return res.send({message:"Password is Required"})
    }
    if(!country){
      return res.send({message:"Country is Required"})
    }
    if(!phone){
      return res.send({message:"Phone is Required"})
    }
    // check user
    const existingUser=await userModel.findOne({email});
    // existingUser user
    if(existingUser){
      return res.status(200).send({
        success: false,
        message: "Already Register please login",
      });
    }
    // hash password
    const hashedPassword = await hashPassword(password);
    // Create new user with verification token
    const verificationToken=Jwt.sign({name,email},process.env.JWT_SECRET,{expiresIn:"30m"})
    // save
    const user=await new userModel({name,email,country,phone,password:hashedPassword,verificationToken })
    .save()
    sendVerificationEmail(email, verificationToken);
    res.status(201).send({
      success: true,
      message: "Check your email and verify your account",
      user,
    })
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      error: error.message,
    });
  }
};

// Route to handle email verification
export const verifyEmailController= async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).send({
        success: false,
        error: 'Verification token is required'
      })
    }
    const decoded = Jwt.verify(token, process.env.JWT_SECRET);
    // Find user by verification token
    const user = await userModel.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).send({
        success: false, 
        error: 'Invalid verification token' 
      });
    }
    // Update user to mark as verified
    user.isVerified = true;
    user.verificationToken = null; // Clear verification token
    await user.save();
    res.status(200).send({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Server error' });
  }
}

// login post request controller
export const loginController = async (req,res) => {
  try {
    const {email,password}=req.body;
    // validation
    if(!email || !password){
        return res.status(404).send({
            success: false,
            message: "Invalid email or password",
        })
    }
    // check user
    const user = await userModel.findOne({ email });
    // check if user is verified
    if( !user.isVerified ){
      return res.json({
        success: false,
        message: "Please verify your email first"
      })
    }
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    const match=await comparePassword(password,user.password);
    if(!match){
        return res.status(200).send({
            success: false,
            message: "Invalid password",
        })
    }
    // token generate
    const token = Jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })
    res.status(200).send({
        success: true,
        message: "login successfully",
        user:{
            _id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
            address: user.address,
            country: user.country,
            phone: user.phone,
            role: user.role,
        },
        token,
    })
  } catch (error) {
    res.status(500).send({
        success: false,
        message: "Error in login",
        error: error.message,
    })
  }
}
// Forgot- controller

// Function to generate a random 4-digit OTP
export const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

export const forgotPasswordController = async (req,res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }
    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email not found",
      });
    }
    const otp = generateOTP(); // Generate OTP
    // Save the OTP to the database
    user.otp = otp;
    await user.save();

    sendVerificationOTP(email, otp);
    res.status(200).send({
      success: true,
      message: "Check your email",
      data: { email, otp }
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error
    });
  }
}

// // Forgot- controller-otp match
export const forgotOtpPasswordController = async (req,res) => {
  try {
    const {email, otp, newPassword}=req.body;
    if(!email){
      return res.status(400).send({message: "Email is required"})
    }
    if(!otp){
      return res.status(400).send({message: "otp is required"})
    }
    if(!newPassword){
      return res.status(400).send({message: "New password is required"})
    }
    // check
    const user=await userModel.findOne({email, otp});
    // validation
    if(!user){
      return res.status(404).send({
        success: false,
        message: "Wrong Email or otp",
      })
    }
    // password hashing
    const hashed=await hashPassword(newPassword);
    const otpa ="";
    // update password
    await userModel.findByIdAndUpdate(user._id, {password: hashed,otp:otpa});
    res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    })
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error
    })
    
  }
}

// test controller
export const testController = (req,res) => {
  try {
    res.send("Protected Routes");
  } catch (error) {
    res.send({error})
  }
}

//update profile
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password,address,country,phone} = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({ error: "Passsword is required and 6 character long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        address,
        country,
        phone
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error WHile Update profile",
      error,
    });
  }
};

// profile pic update update Profile Pic Controller
export const updateProfilePicController =  async (req, res) => {
  try {
    const { id } = req.params;
    const result = await cloudinary.uploader.upload(req.file.path);
    const user = await userModel.findByIdAndUpdate(id,
      {
        image: result.secure_url,
        cloudinary_id: result.public_id
      },
      {new: true}
      );
    res.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      user
    })
  }
  catch (error) {
    res.status(400).send({
      success: false,
      message: "Error WHile Update profile",
    })
  }
}

//orders user profile show
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};

//orders admin profile show
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};

// only last order show
export const getLastOrderShow = async (req, res) => {
  try {
    const lastOrder = await orderModel
      .findOne({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: -1 });
    if (!lastOrder) {
      return res.status(404).json({ success: false, message: "No orders found." });
    }
    res.json(lastOrder);
  } catch (error) {
    console.error("Error while getting last order:", error);
    res.status(500).json({ success: false, message: "Error while getting last order.", error });
  }
}

//order status
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error While Updating Order",
      error,
    });
  }
};

// all order delete
export const deleteOrderController = async (req, res) => {
  try {
    const { id } = req.params;
    const orders = await orderModel.findByIdAndDelete(id);
    res.json(orders);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error While Deleting Order",
      error,
    });
  }
}

// total order collection delete
export const totalDeleteOrderController = async (req, res) => {
  try {
    const orders = await orderModel.deleteMany();
    res.json(orders);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error While Deleting Order",
      error,
    });
  }
}


// all user show
export const getAllUser = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.json(users);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error WHile Getting All Users",
      error,
    });
  }
}
// online user show
export const liveConsol = async (req, res) => {
  try {
    const users = await userModel.find({"role": 0});
    res.json(users);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error WHile Getting All Users",
      error,
    });
  }
}


// user delete
export const deleteUser = async (req, res) => {
  try {
    const {id} = req.params;
    const user = await userModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "User deleted successfully",
    })
  }
  catch(error){
    res.status(500).send({
      success: false,
      message: "Error While Deleting User",
      error,
    })
  }
}

// user update
export const updateUser = async (req, res) => {
  try {
    const {role} = req.body;
    const {id} = req.params;
    const user = await userModel.findByIdAndUpdate(id,
      {
        role: role
      },
      {new: true});
    res.status(200).send({
      success: true,
      message: "User updated successfully",
      user
    })
  }
  catch(error){
    res.status(500).send({
      success: false,
      message: "Error While Updating User",
      error,
    })
  }
}
