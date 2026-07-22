const mongoose = require("mongoose");

const searchHistorySchema =
    new mongoose.Schema(
        {
            userId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
                required:true,
                index:true
            },

            query:{
                type:String,
                required:true,
                trim:true
            },

            rankingMode:{
                type:String,

                enum:[
                    "balanced",
                    "relevant",
                    "latest",
                    "influential"
                ],

                default:"balanced"
            },

            searchedAt:{
                type:Date,
                default:Date.now
            }
        }
    );

searchHistorySchema.index(
    {
        userId:1,
        searchedAt:-1
    }
);

module.exports =
    mongoose.model(
        "SearchHistory",
        searchHistorySchema
    );