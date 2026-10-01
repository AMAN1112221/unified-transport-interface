const mongoose=require("mongoose");
const userSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        phone:{
            type:String,
            required:true,
            trim:true
            
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true
        },
        password:{
            type:String,
            required:true,

        },
        tokenVersion:{
            type:Number,
            default:0,
            select:false
        },
        role:{
            type:String,
            required:true,
            enum:["sender","receiver","driver","truck_owner"]
        },
        companyName:{
            type:String,
            trim:true,
        },
        truckNumber:{
            type:String,
            trim:true,
        },
        deliveryAddress:{
            type:String,
            trim:true,
            maxlength:300
        },
        city:{
            type:String,
            trim:true,
            maxlength:100
        },
        postalCode:{
            type:String,
            trim:true,
            maxlength:20
        }
    },
    {
        timestamps:true
    }
);

const User=mongoose.model("User",userSchema);

module.exports=User;
