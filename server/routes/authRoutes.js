const express=require("express");
const { signup, login, logout, getProfile, updateProfile } = require("../controllers/authController");

const router=express.Router();
const protect = require("../middleware/authMiddleware");


router.post("/signup",signup);
router.post("/login",login);
router.post("/logout", protect, logout);
router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);

module.exports=router;