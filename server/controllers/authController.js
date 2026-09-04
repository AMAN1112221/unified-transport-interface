const User=require("../models/User");
const jwt=require("jsonwebtoken");
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

const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Email, password and role are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (user.role !== role) {
            return res.status(403).json({
                message: "Selected role does not match your account"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};
module.exports={ signup,login };