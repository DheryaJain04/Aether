const mongoose = require("mongoose");

const projectPaperSchema = new mongoose.Schema(
    {
        paperId: {
            type: String,
            required: true
        },
        paperData: {
            type: Object,
            required: true
        },
        readingStatus: {
            type: String,
            enum: ["unread", "reading", "read", "reviewed"],
            default: "unread"
        },
        tags: {
            type: [String],
            default: []
        },
        addedAt: {
            type: Date,
            default: Date.now
        },
        reviewedAt: {
            type: Date
        }
    },
    { _id: false }
);

const researchQuestionSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: "",
            trim: true
        },
        status: {
            type: String,
            enum: ["open", "in_progress", "answered"],
            default: "open"
        },
        answer: {
            type: String,
            default: ""
        },
        relatedPaperIds: {
            type: [String],
            default: []
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

const researchNoteSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            default: ""
        },
        tags: {
            type: [String],
            default: []
        },
        paperId: {
            type: String,
            default: null
        },
        questionId: {
            type: String,
            default: null
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

const projectCollectionSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        paperIds: {
            type: [String],
            default: []
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

const projectActivitySchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

const projectSynthesisSchema = new mongoose.Schema(
    {
        generatedAt: {
            type: Date,
            default: Date.now
        },
        sourcePaperIds: {
            type: [String],
            default: []
        },
        sections: {
            majorThemes: { type: String, default: "" },
            commonMethodologies: { type: String, default: "" },
            keyFindings: { type: String, default: "" },
            conflictingFindings: { type: String, default: "" },
            commonLimitations: { type: String, default: "" },
            openQuestions: { type: String, default: "" },
            potentialGaps: { type: String, default: "" }
        },
        markdownOverview: {
            type: String,
            default: ""
        }
    },
    { _id: false }
);

const projectSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: "",
            trim: true
        },
        goal: {
            type: String,
            default: "",
            trim: true
        },
        papers: {
            type: [projectPaperSchema],
            default: []
        },
        questions: {
            type: [researchQuestionSchema],
            default: []
        },
        notes: {
            type: [researchNoteSchema],
            default: []
        },
        collections: {
            type: [projectCollectionSchema],
            default: []
        },
        activity: {
            type: [projectActivitySchema],
            default: []
        },
        synthesis: {
            type: projectSynthesisSchema,
            default: null
        },
        lastActiveAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

projectSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model("Project", projectSchema);
