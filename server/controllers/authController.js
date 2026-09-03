const User=require("../models/User");
const bcrypt=require("bcrypt");
const signup=async (req,res)=>{
    try{
        const {name,phone,email,password,role,companyName,truckNumber}=req.body;
        const existingUser=await User.findOne({email});
        if(existingUser)
        {
            return res.status(400).json({
                message:"Email already registered"
            });
        }
        const hashedPassword=await bcrypt.hash(password, 10);

        const user=await User.create({
            name,
            phone,
            email,
            password:hashedPassword,
            role,
            companyName,
            truckNumber
        });
        res.status(201).json({
            message:"Account created successfully",
            user:{
                id:user._id,
                name:user.name,
                phone:user.phone,
                email:user.email,
                role:user.role,
                companyName:user.companyName,
                truckNumber:user.truckNumber
            }
        });

    }catch(error){
        res.status(500).json({
            message:"Server error",
            error:error.message
        });
    }
};
module.exports={ signup };