# Aether

### An AI-powered One-Stop Research workspace for academic research

[Live Demo](https://aether-sand-five.vercel.app/) · [GitHub](https://github.com/DheryaJain04/Aether)
> <img width="782" height="404" alt="image" src="https://github.com/user-attachments/assets/0e9533e5-3de8-4590-af44-f412a140e7e4" />

Are you also tired of opening 100 tabs and shifting between them tirelessly whole night long? If yes, then Aether is your solution!
Aether is a **Full-Stack One-Stop Research Assistant Platform** designed to take the workflow of working with academic literature beyond simply finding papers and help you make your research process smoother than ever.

It brings together paper discovery, intelligent ranking, AI-assisted reading, research organization, and multi-paper analysis in one workspace.

Search for literature, understand individual papers, save and organize your reading, create research projects, and use **Lab** to analyse several papers together with a multi-agent AI pipeline.

---

## What Aether does

Research usually involves jumping between search engines, papers, notes, citation tools, spreadsheets, and AI assistants.
Aether bring those pieces together.

**#Discover:** Search academic literature through **OpenAlex** and rank the results using Aether's own scoring system rather than relying solely on keyword relevance.

**#Understand:** Open a paper, generate an AI summary, extract useful keywords, generate citations, or ask questions about the paper using a retrieval-augmented chatbot.

**#Organize:** Save papers into collections, create research projects, track reading progress, write notes, maintain research questions, and keep a history of your research activity.

**#Analyse:** Move several papers into **Lab** and run cross-paper analysis using four specialised AI agents.

---

# Core Features

## 🔎 Intelligent Academic Search

Aether lets you search through academic literature using the **OpenAlex API**. There is also a custom ranking system on top of the search results so that papers can be viewed based on different priorities.

The available ranking modes are:

- **Balanced**
- **Most Relevant**
- **Latest Research**
- **Most Influential**

The importance of relevance, impact, freshness, and venue quality can also be readjusted, and the papers are instantly re-ranked without making another search request.

> <img width="743" height="366" alt="image" src="https://github.com/user-attachments/assets/17ec528a-1e36-40fb-be44-b138072b3e90" />


---

## 🧠 Aether Ranking Engine - Aether Score

Instead of ranking papers purely by keyword matching, Aether combines multiple signals to calculate an **Aether Score**.

```text
Aether Score = (w₁ × Relevance) + (w₂ × Impact) + (w₃ × Freshness) + (w₄ × Venue)
```

Relevance itself combines **semantic similarity** with **BM25 lexical matching**, while the other signals capture things like citations, publication freshness, and venue quality.
This lets the user choose whether they want the **most relevant**, **newest**, or **most influential** research depending on what they are looking for.

---

## 📄 Paper Intelligence

Once the user finds a paper, Aether gives them several ways to understand and work with it:

- **AI Summary** — Get a quick structured overview of the paper.
- **Keyword Extraction** — Identify the important topics and terms.
- **Citation Generator** — Generate citations in APA, IEEE, MLA, or BibTeX.
- **Ask Aether** — Ask questions about that specific paper using RAG.

> <img width="525" height="316" alt="image" src="https://github.com/user-attachments/assets/91caea90-5b7d-42f4-8140-6f961659e754" />

---

## 💬 Ask Aether - RAG Chatbot

The Ask Aether chatbot allows the user to ask questions directly about a specific research paper instead of relying only on the LLM's general knowledge.

When a PDF is available, Aether:
```text
PDF → Text Extraction → Semantic Chunking → FAISS Embeddings → Vector Retrieval → LLM → Grounded Answer
```

If the PDF cannot be retrieved, Aether falls back to using the **paper's abstract**.

> <img width="362" height="419" alt="image" src="https://github.com/user-attachments/assets/0b9f1358-3505-47f0-9231-e3ea9b69f7b8" />

---

## 🧪 Scholar Lab - A Cross-Paper Intelligence Studio

**Scholar Lab** is where the user can load multiple papers onto a **workbench** and analyse them together using different tools. Aether has 4 different research tools that help a researcher organise his ideas:

### Literature Synthesis Tool
Find common findings, agreements, contradictions, trends, and possible future directions.

### Paper Comparison Tool
Compare papers across their problem, methodology, datasets, results, contributions, and limitations.

### Evidence Matrix Tool
Connect research claims with the papers that **support, contradict, or remain silent** on them.

### Research Gap Detector Tool
Look across the selected literature to identify missing research areas, unexplored assumptions, open questions, and potential research directions.

> <img width="959" height="439" alt="image" src="https://github.com/user-attachments/assets/3b7badae-ff55-4731-b735-4c8f07d7cb66" />
---

## 🤖 Multi-Agent Lab Pipeline

Aether Lab uses a four-stage pipeline instead of sending all the papers to a single prompt:

```text
Staged Papers -> Context Packager -> Domain Extractor -> Cross-Paper Arbiter -> Grounding Validator -> Lab Results
```
Each stage has a specific role: preparing the paper context, extracting structured information, reasoning across papers, and finally checking the generated results against the provided literature.

> <img width="633" height="265" alt="image" src="https://github.com/user-attachments/assets/cb100b43-c2f4-4dde-999e-b8ddb97467e5" />
---

## 📚 Scholar Library - Research Workspace

Aether also has a separate research Workspace called "**Scholar Library**" which allows user to organize their research.

- **Collections** — Save and organize papers by topic.
- **Research Projects** — Keep papers, notes, reading status, questions, and AI synthesis together.
- **Notes & Questions** — Keep track of ideas while reading.
- **History** — Revisit previous searches and papers viewed.

> <img width="916" height="436" alt="image" src="https://github.com/user-attachments/assets/63a0a4e4-2288-49bc-9414-0419f98aa466" />

# 🏗️ Architecture

```text
                         ┌───────────────────┐
                         │   React + Vite    │
                         │      Vercel       │
                         └─────────┬─────────┘
                                   │
                              HTTPS / API
                                   │
                                   ▼
                         ┌───────────────────┐
                         │ Node.js + Express │
                         │      Render       │
                         └───────┬───┬───────┘
                                 │   │
                    ┌────────────┘   └─────────────┐
                    ▼                              ▼
           ┌────────────────┐            ┌─────────────────┐
           │ MongoDB Atlas  │            │ External APIs   │
           │                │            │                 │
           │ Users          │            │ OpenAlex        │
           │ Papers         │            │ Gemini          │
           │ Projects       │            │ Groq            │
           │ Collections    │            │ Ollama          │
           │ History        │            │                 │
           └────────────────┘            └─────────────────┘
```

The application is split into a React/Vite client and an Express backend.
The backend handles authentication, database operations, academic search, ranking, AI orchestration, RAG, and the Lab pipeline.
MongoDB Atlas stores user and research data, while OpenAlex provides the academic literature layer.

---

# 🛠️ Tech Stack

| Area | Technology |
|---|---|
| Frontend | React 19,  Vite, Vanilla CSS |
| Routing | React Router |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Academic Data | OpenAlex |
| LLM APIs | Google Gemini, Groq, Ollama |
| Embeddings | nomic-embed-text |
| RAG | LangChain |
| Vector Search | FAISS |
| Lexical Search | BM25 |
| Authentication | JWT + HTTP-only cookies |
| Password Hashing | bcrypt |
| API Protection | Rate limiting + CORS |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

---

# 📁 Project Structure

```text
Aether/
│
├── client/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── SearchResults.jsx
│       │   ├── PaperDetail.jsx
│       │   ├── SavedPapers.jsx
│       │   ├── ScholarLab.jsx
│       │   └── lab/
│       │       ├── SynthesisTool.jsx
│       │       ├── CompareTool.jsx
│       │       ├── MatrixTool.jsx
│       │       └── GapsTool.jsx
│       │
│       └── services/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── services/
│       ├── aiService.js
│       ├── aetherScoreService.js
│       ├── relevanceService.js
│       ├── ragService.js
│       ├── citationService.js
│       └── lab/
│           ├── labPipeline.js
│           ├── paperContextPackager.js
│           ├── domainExtractor.js
│           ├── crossPaperArbiter.js
│           └── groundingValidator.js
│
├── package.json
└── README.md
```

---

# 🔐 Authentication & Security

Aether uses authenticated, user-specific workflows rather than treating the application as a public search interface.

The backend uses:

- JWT-based authentication
- HTTP-only cookies
- bcrypt password hashing
- Protected API routes
- User-scoped database operations
- Rate limiting
- CORS controls
- Security-related HTTP headers

User-owned resources such as collections, projects, notes, and history are associated with the authenticated user.

---

# 🚀 Running Aether Locally

## Prerequisites

- Node.js
- MongoDB Atlas account
- Gemini API key
- Groq API key
- Ollama (optional)

## Installation

```bash
git clone https://github.com/DheryaJain04/Aether.git
cd Aether

npm install
npm --prefix client install
```

## Environment variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=
GROQ_API_KEY=
MONGODB_URI=
JWT_SECRET=
NODE_ENV=development
```

Keep these values private and never commit your `.env` file.

## Start the backend

```bash
npm run server:dev
```

## Start the frontend

In another terminal:

```bash
npm run client:dev
```

The development frontend runs on:

```text
http://localhost:5173
```

and the backend runs on:

```text
http://localhost:3000
```

---

# ☁️ Deployment

Aether is deployed as a three-part production system:

```text
React frontend  →  Vercel
Express backend →  Render
MongoDB          →  MongoDB Atlas
```

The frontend communicates with the production API through Vercel rewrites to the Render backend.

---

# 🗺️ What's Next

Aether is still an evolving project. Some directions worth exploring include:

- Additional academic data sources
- User-uploaded research papers
- Citation graph visualisation
- Collaborative research projects
- Exporting Lab results as Markdown/PDF
- More advanced research planning tools

---

# 👨‍💻 Author

**Dherya Jain**

Aether started as an attempt to build a better way of finding academic papers and gradually grew into a complete research environment.

The project has been an exploration of full-stack development and applied AI — from search and ranking systems to RAG, LLM fallbacks, vector retrieval, and multi-agent workflows.

---

<p align="center">
  **Built with curiosity and experimentation <3**
</p>
