const express=require("express");
const {signup ,login}=require("../controllers/authController");

const router=express.Router();
const protect=require("../middleware/authMiddleware");
router.get("/profile",protect,(req,res)=>{
    res.status(200).json({
        message:"You are authorized",
        user:req.user
    })
})


router.post("/signup",signup);
router.post("/login",login);

module.exports=router;