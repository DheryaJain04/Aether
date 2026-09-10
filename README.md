# Aether

Aether is an AI-powered academic research engine and cross-paper intelligence studio. Powered by millions of academic papers from OpenAlex, Aether pairs a hybrid multi-factor ranking engine with full-paper RAG synthesis and Scholar Lab — an interactive workbench designed for multi-paper cognitive analysis.

---

## Key Features

### 1. Multi-Factor Academic Ranking Engine
- **Four Core Dimensions**:
  - **Relevance**: Dense semantic embedding similarity combined with BM25 lexical keyword matching.
  - **Freshness**: Exponential temporal decay highlighting the latest breakthroughs.
  - **Impact**: Log-normalized citation count and 3-year citation momentum acceleration.
  - **Venue**: Journal prestige, peer-review accreditation, DOAJ open-access indexing, and conference tiers.
- **Dynamic Retrieval Modes**: Balanced, Relevance Focus, Freshness Focus, Most Influential (Impact), Venue Quality, and Custom Slider Weights.
- **Zero-Latency Re-Ranking**: Instant calculation and sorting directly on the client without re-fetching data.

### 2. Scholar Lab: Cross-Paper Intelligence Studio
Stage up to 10 papers onto an interactive workbench and run specialized multi-agent analytical tools:
- **Literature Synthesis**: Cross-paper meta-analysis identifying theoretical consensus, methodological convergence, and contradictions.
- **Paper Comparison**: Structured side-by-side matrices comparing problem formulations, methods, datasets, quantitative results, and limitations.
- **Evidence Matrix**: Claims vs. papers grid tagging empirical stances (Supports, Contradicts, Silent) with citation excerpts.
- **Research Gap Detector**: Identifies unexplored frontiers, missing benchmarks, and unaddressed assumptions.

### 3. Single-Paper Insights and RAG Chat
- **Aether Summary & Keywords**: Fast, structured summaries and relevant academic keywords.
- **Ask Aether (RAG Chatbot)**: Chat directly with any paper using full-text PDF vector retrieval (FAISS + LangChain) with fallback to abstract grounding.
- **Citation Generator**: Quick copy formatting for APA, IEEE, MLA, and BibTeX.

### 4. Scholar Library and Workspace
- **Saved Papers & Collections**: Organize literature into custom folders and research playlists.
- **History Tracking**: Seamless retrieval of past searches and viewed papers.
- **Authentication**: JWT authentication with secure httpOnly cookies and bcrypt password hashing.

---

## Tech Stack

- **Frontend**: React 18, React Router v6, Vite, Vanilla CSS (Celestial Dark theme)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas, Mongoose
- **AI Models & Inference**: Google Gemini, Groq SDK, Local Ollama (Qwen 2.5)
- **Vector Search & RAG**: LangChain, FAISS Vector Store, Recursive Text Chunking
- **Data Source**: OpenAlex REST API

---

## Project Structure

```
Aether/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # AuthContext, LabContext
│   │   ├── pages/       # Search, Paper Details, Saved Papers, Scholar Lab
│   │   │   └── lab/     # Synthesis, Compare, Matrix, Gaps tools
│   │   └── services/    # Client API services
├── config/              # Database connection configuration
├── controllers/         # Express controllers (search, paper, auth, lab)
├── middleware/          # Authentication middleware
├── models/              # Mongoose data models
├── routes/              # Express API route declarations
├── services/            # Backend AI, RAG, and scoring services
└── app.js               # Express application entrypoint
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance
- API Keys: Google Gemini API, Groq API (Optional: Local Ollama)

### Environment Setup
Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

### Installation and Execution

1. Install root backend dependencies:
```bash
npm install
```

2. Start the backend server:
```bash
npm run dev
```

3. In a separate terminal, install client dependencies and run the frontend:
```bash
cd client
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` and the backend API on `http://localhost:5000`.

---

## License

This project is licensed under the MIT License.

Developed by **Dherya Jain**
