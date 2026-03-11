# 📊 Sales Insight Automator — Rabbitt AI

A containerized full-stack application that lets users upload sales data (CSV/XLSX), generates an AI-powered executive summary via **Groq (Llama 3.3 70B)**, and emails the report to the specified recipient.

---

## ✨ Features

| Layer | Tech | Details |
|-------|------|---------|
| **Frontend** | React 18 | Drag-and-drop upload, real-time status feedback, responsive dark UI |
| **Backend** | Node.js / Express | Secured REST API with rate limiting, input validation, Swagger docs |
| **AI Engine** | Groq (Llama 3.3 70B) | Parses sales data → professional narrative summary |
| **Email** | Nodemailer (SMTP) | Sends a beautifully formatted HTML report to recipient |
| **DevOps** | Docker, GitHub Actions | Production Dockerfiles, docker-compose, CI pipeline |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm**
- A **Groq API key** → [console.groq.com](https://console.groq.com)
- A **Gmail App Password** (or any SMTP credentials) → [Google App Passwords](https://myaccount.google.com/apppasswords)

### 1. Clone & configure

```bash
git clone https://github.com/<your-username>/Rabbitt.Ai.git
cd Rabbitt.Ai

# Copy the example env and fill in your keys
cp .env.example backend/.env
```

Edit `backend/.env` and fill in:

```env
GROQ_API_KEY=gsk_...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=you@gmail.com
FRONTEND_URL=http://localhost:3000
```

### 2. Run locally (without Docker)

**Backend:**

```bash
cd backend
npm install
npm run dev          # starts on http://localhost:5000
```

**Frontend** (new terminal):

```bash
cd frontend
npm install
npm start            # starts on http://localhost:3000
```

### 3. Run with Docker Compose

```bash
# Make sure backend/.env exists with your keys
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Swagger Docs | http://localhost:5000/api-docs |

---

## 📖 API Documentation

Swagger UI is live at **`/api-docs`** when the backend is running.

### `POST /api/analyze`

| Field | Type | Description |
|-------|------|-------------|
| `file` | `multipart/form-data` | `.csv` or `.xlsx` file (max 5 MB) |
| `email` | `string` | Valid recipient email address |

**Success (200):**
```json
{
  "message": "Summary sent successfully!",
  "summary": "Q1 2026 saw strong electronics performance..."
}
```

---

## 🔒 Security Overview

| Measure | Implementation |
|---------|---------------|
| **Helmet** | Sets secure HTTP headers (CSP, HSTS, X-Frame, etc.) |
| **CORS** | Origins restricted to the configured frontend URL |
| **Rate Limiting** | 20 requests per 15 min per IP on `/api/*` |
| **Input Validation** | `express-validator` sanitizes/validates email; `multer` enforces file type and 5 MB cap |
| **HPP** | Blocks HTTP parameter pollution |
| **No disk writes** | Files are processed in-memory only — never stored on the server |
| **Error masking** | Internal errors return generic messages; stack traces never exposed |

---

## 📁 Project Structure

```
Rabbitt.Ai/
├── backend/
│   ├── server.js            # Express app entry point
│   ├── swagger.js            # Swagger/OpenAPI config
│   ├── routes/
│   │   └── upload.js         # POST /api/analyze
│   ├── services/
│   │   ├── aiService.js      # Groq LLM integration
│   │   ├── emailService.js   # Nodemailer SMTP
│   │   └── parseService.js   # CSV/XLSX parser
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.js            # Main SPA component
│   │   ├── App.css           # Styles
│   │   └── index.js          # Entry point
│   ├── public/index.html
│   ├── nginx.conf            # Production nginx config
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
├── .github/workflows/ci.yml  # CI pipeline
├── .env.example
└── README.md
```

---

## ⚙️ CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on PRs and pushes to `main`:

1. **Backend** — `npm ci` + ESLint
2. **Frontend** — `npm ci` + production build
3. **Docker** — Validates `docker-compose.yml`

---

## 📧 Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Use that 16-character password as `SMTP_PASS` in your `.env`

---

## 📝 License

MIT
