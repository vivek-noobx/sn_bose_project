# 🧠 AI-Powered Resume Intelligence & Adaptive Job Matching System

An intelligent hiring platform that leverages **Google Gemini AI** and **vector embeddings** to parse resumes, match candidates to jobs, generate skill assessments, and streamline the recruitment pipeline — all in a single, full-stack application.

---

## ✨ Features

| Feature | Description |
|---|---|
| **📄 Smart Resume Parsing** | Upload PDF resumes and extract structured data (skills, experience, education) using Gemini AI |
| **🔍 Semantic Job Matching** | Match candidates to jobs using ChromaDB vector similarity — not just keyword matching |
| **📝 Adaptive Assessments** | Auto-generate coding challenges and skill tests tailored to each job's requirements |
| **🔐 Auth System** | JWT-based authentication with role-based access (candidate / recruiter) |
| **📧 Email Notifications** | Automated email alerts for assessment invites and status updates via Nodemailer |
| **📊 Recruiter Dashboard** | View, create, and manage job postings with candidate ranking |

---

## 🏗️ Tech Stack

### Frontend
- **React 19** + **TypeScript**
- **Vite** — lightning-fast dev server & build tool
- **Tailwind CSS 4** — utility-first styling
- **React Router 7** — client-side routing
- **Lucide React** — icon library

### Backend
- **Express 5** + **TypeScript** (via TSX)
- **Google Gemini AI** (`@google/genai`) — resume parsing, test generation, code evaluation
- **ChromaDB** — vector database for semantic search
- **LangChain** (`@langchain/google-genai`) — embedding pipeline
- **SQLite 3** — lightweight relational database
- **JWT + bcrypt** — authentication & password hashing
- **Multer** — file upload handling
- **Nodemailer** — transactional emails
- **Zod** — input validation

---

## 📁 Project Structure

```
sn_bose/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   │   ├── assessmentController.ts
│   │   │   ├── authController.ts
│   │   │   ├── jobController.ts
│   │   │   └── uploadController.ts
│   │   ├── middleware/         # JWT auth middleware
│   │   ├── routes/             # Express route definitions
│   │   ├── services/           # Core business logic
│   │   │   ├── chromaService.ts       # Vector DB operations
│   │   │   ├── resumeParser.ts        # AI-powered resume extraction
│   │   │   ├── testGenerator.ts       # Adaptive test creation
│   │   │   ├── assessmentEvaluator.ts # AI assessment grading
│   │   │   ├── codeEvaluator.ts       # Code submission evaluation
│   │   │   ├── emailService.ts        # Email notifications
│   │   │   └── db.ts                  # SQLite initialization
│   │   └── index.ts            # Server entry point
│   ├── .env.example            # Environment variable template
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── context/            # React Context providers
│   │   │   ├── AuthContext.tsx
│   │   │   └── ResumeContext.tsx
│   │   ├── layouts/            # Page layout wrappers
│   │   ├── pages/              # Route-level components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ResumeUpload.tsx
│   │   │   ├── JobMatches.tsx
│   │   │   ├── Assessment.tsx
│   │   │   ├── CreateJob.tsx
│   │   │   ├── JobCandidates.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Google Gemini API key** ([get one here](https://aistudio.google.com/apikey))

### 1. Clone the repository

```bash
git clone https://github.com/amitsah19/AI-Powered-Resume-Intelligence-Adaptive-Job-Matching-System.git
cd AI-Powered-Resume-Intelligence-Adaptive-Job-Matching-System
```

### 2. Set up the Backend

```bash
cd backend
npm install

# Create your .env from the template
cp .env.example .env
# Edit .env and fill in your actual keys
```

### 3. Set up the Frontend

```bash
cd frontend
npm install
```

### 4. Run the Application

Open **two terminal windows**:

```bash
# Terminal 1 — Backend (runs on port 5001)
cd backend
npm run dev

# Terminal 2 — Frontend (runs on port 5173)
cd frontend
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## ⚙️ Environment Variables

Create a `backend/.env` file using the template:

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `5001`) |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `SMTP_HOST` | SMTP mail server (e.g., `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (e.g., `587`) |
| `SMTP_SECURE` | Use TLS (`true`/`false`) |
| `SMTP_USER` | Email sender address |
| `SMTP_PASS` | Email app password |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and get JWT token |
| `POST` | `/api/upload` | Upload and parse a resume (PDF) |
| `GET` | `/api/jobs` | List all job postings |
| `POST` | `/api/jobs` | Create a new job posting |
| `GET` | `/api/jobs/:id/candidates` | Get ranked candidates for a job |
| `POST` | `/api/assessment/generate` | Generate adaptive assessment |
| `POST` | `/api/assessment/evaluate` | Evaluate assessment submission |
| `GET` | `/api/health` | Health check |

---

## 🛠️ How It Works

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Resume     │────▶│  Gemini AI   │────▶│  Structured  │
│   (PDF)      │     │  Parser      │     │  Profile     │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                │
                                    ┌───────────▼───────────┐
                                    │   ChromaDB Vectors    │
                                    │   (Semantic Search)   │
                                    └───────────┬───────────┘
                                                │
┌─────────────┐     ┌──────────────┐     ┌──────▼───────┐
│   Job        │────▶│  Vector      │────▶│  Ranked      │
│   Posting    │     │  Matching    │     │  Candidates  │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                │
                                    ┌───────────▼───────────┐
                                    │  Adaptive Assessment  │
                                    │  (AI Generated Tests) │
                                    └───────────────────────┘
```

1. **Resume Upload** → Gemini AI extracts skills, experience, and education from the PDF
2. **Vectorization** → Resume data is embedded and stored in ChromaDB
3. **Job Matching** → When a job is posted, ChromaDB performs semantic similarity search to rank candidates
4. **Assessment** → AI generates role-specific coding challenges and evaluates submissions
5. **Notification** → Candidates receive email invites for assessments

---

## 📄 License

This project is for educational and demonstration purposes.

---

<p align="center">
  Built with ❤️ using Gemini AI, React, and Express
</p>
