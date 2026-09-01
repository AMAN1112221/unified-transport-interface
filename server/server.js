const express=require("express");
const healthRoutes=require("./src/routes/healthRoutes");
const app=express();



app.use("/api/health",healthRoutes);

app.listen(5000,()=>{
    console.log("FleetFlow server running on port 5000");
})