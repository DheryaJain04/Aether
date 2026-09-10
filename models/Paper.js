const mongoose = require("mongoose");

const authorSchema =
    new mongoose.Schema(
        {
            name:{
                type:String,
                required:true
            },

            openAlexId:{
                type:String,
                default:null
            }
        },
        {
            _id:false
        }
    );

const paperSchema =
    new mongoose.Schema(
        {
            openAlexId:{
                type:String,
                required:true,
                unique:true,
                index:true
            },

            title:{
                type:String,
                required:true
            },

            authors:{
                type:[authorSchema],
                default:[]
            },

            abstract:{
                type:String,
                default:null
            },

            publicationYear:{
                type:Number,
                default:null
            },

            publicationDate:{
                type:Date,
                default:null
            },

            journal:{
                type:String,
                default:null
            },

            doi:{
                type:String,
                default:null
            },

            paperUrl:{
                type:String,
                default:null
            },

            pdfUrl:{
                type:String,
                default:null
            },

            openAccess:{
                type:Boolean,
                default:false
            },

            publicationType:{
                type:String,
                default:null
            },

            citedByCount:{
                type:Number,
                default:0
            },

            topics:{
                type:[String],
                default:[]
            },

            fullText:{
                type:String,
                default:null
            },

            isCustom:{
                type:Boolean,
                default:false
            }
        },
        {
            timestamps:true
        }
    );

module.exports =
    mongoose.model(
        "Paper",
        paperSchema
    );