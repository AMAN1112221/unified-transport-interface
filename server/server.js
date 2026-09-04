require("dotenv").config();
const connectDB=require("./config/db");
const authRoutes=require("./routes/authRoutes");
const express=require("express")
const cors=require("cors");
const app=express();


app.use(cors());
app.use(express.json());

app.use("/api/auth",authRoutes);



const PORT=5000;

connectDB();

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
})