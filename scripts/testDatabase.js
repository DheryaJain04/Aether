const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const mongoose = require("mongoose");

const User = require("../models/User");
const Paper = require("../models/Paper");
const Collection = require("../models/Collection");
const SearchHistory = require("../models/SearchHistory");
const ViewHistory = require("../models/ViewHistory");

async function testDatabase(){
    try{
        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log("MongoDB connected");

        const testEmail =
            "test@aether.dev";

        await User.deleteOne({
            email:testEmail
        });

        const user =
            await User.create({
                name:"Aether Test User",
                email:testEmail,
                passwordHash:"temporary-test-hash"
            });

        console.log(
            "1. User created:",
            user.email
        );

        const paper =
            await Paper.findOneAndUpdate(
                {
                    openAlexId:"W_TEST_AETHER"
                },
                {
                    openAlexId:"W_TEST_AETHER",
                    title:"Test Research Paper for Aether",
                    authors:[
                        {
                            name:"Test Author"
                        }
                    ],
                    abstract:
                        "This is a temporary paper used to test the Aether database architecture.",
                    publicationYear:2026,
                    journal:"Aether Test Journal",
                    openAccess:true,
                    publicationType:"article",
                    citedByCount:100,
                    topics:[
                        "Artificial Intelligence",
                        "Retrieval Augmented Generation"
                    ]
                },
                {
                    upsert:true,
                    new:true
                }
            );

        console.log(
            "2. Paper upserted:",
            paper.title
        );

        const collection =
            await Collection.create({
                userId:user._id,
                name:"RAG Research",
                description:
                    "Research papers about Retrieval Augmented Generation.",
                papers:[
                    paper._id
                ]
            });

        console.log(
            "3. Collection created:",
            collection.name
        );

        await SearchHistory.create({
            userId:user._id,
            query:
                "retrieval augmented generation",
            rankingMode:"balanced"
        });

        console.log(
            "4. Search history created"
        );

        await ViewHistory.findOneAndUpdate(
            {
                userId:user._id,
                paperId:paper._id
            },
            {
                viewedAt:new Date()
            },
            {
                upsert:true,
                new:true
            }
        );

        console.log(
            "5. View history created"
        );

        const populatedCollection =
            await Collection
                .findById(
                    collection._id
                )
                .populate("papers");

        console.log(
            "\n===== AETHER DATABASE TEST ====="
        );

        console.log(
            "User:",
            user.name
        );

        console.log(
            "Collection:",
            populatedCollection.name
        );

        console.log(
            "Saved Paper:",
            populatedCollection
                .papers[0]
                .title
        );

        console.log(
            "================================"
        );

        console.log(
            "\nDatabase architecture test successful!"
        );

    }catch(err){
        console.error(
            "Database test failed:",
            err
        );
    }finally{
        await mongoose.disconnect();

        console.log(
            "MongoDB disconnected"
        );
    }
}

testDatabase();