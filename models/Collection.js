const mongoose = require("mongoose");

const collectionSchema =
    new mongoose.Schema(
        {
            userId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
                required:true,
                index:true
            },

            name:{
                type:String,
                required:true,
                trim:true
            },

            description:{
                type:String,
                default:"",
                trim:true
            },

            papers:[
                {
                    type:
                        mongoose.Schema.Types.ObjectId,

                    ref:"Paper"
                }
            ]
        },
        {
            timestamps:true
        }
    );

collectionSchema.index(
    {
        userId:1,
        name:1
    },
    {
        unique:true
    }
);

module.exports =
    mongoose.model(
        "Collection",
        collectionSchema
    );