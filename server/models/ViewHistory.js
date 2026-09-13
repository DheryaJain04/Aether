const mongoose = require("mongoose");

const viewHistorySchema =
    new mongoose.Schema(
        {
            userId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
                required:true,
                index:true
            },

            paperId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Paper",
                required:true
            },

            viewedAt:{
                type:Date,
                default:Date.now
            }
        }
    );

viewHistorySchema.index(
    {
        userId: 1,
        viewedAt: -1
    }
);

viewHistorySchema.index(
    {
        userId: 1,
        paperId: 1
    },
    {
        unique: true
    }
);

module.exports =
    mongoose.model(
        "ViewHistory",
        viewHistorySchema
    );