# AI Customer Complaint Platform

A full-stack complaint management system with a multi-agent AI pipeline. Customers submit complaints and get back a classification, sentiment score, priority level, and a suggested resolution all within a few seconds.

Built with FastAPI, React 19, PostgreSQL, and Google Gemini.

---

## What it does

- Classifies complaints into categories (Billing, Technical, Delivery, Service, Security)
- Detects sentiment and priority level
- Generates a resolution and satisfaction prediction using Gemini
- Admin dashboard with full complaint history, agent queue, and resolution logs
- Google OAuth login with OTP verification
- Email notifications via Brevo

---

## Stack

The Tech Stack

Frontend: Built with React 19 and Vite for speed. I’m using Framer Motion to keep the UI feeling fluid and polished.

Backend: A FastAPI core running on Python 3.11, using SQLAlchemy to talk to the database.

Data & Auth: PostgreSQL 15 handles the heavy lifting, while security is managed via JWT and Google OAuth (passwords hashed with bcrypt, naturally).

The AI bit: Powered by Gemini.

Infrastructure: Brevo for transactional emails and the whole thing is containerized with Docker Compose for easy deployments.
---

## Running locally

**Requirements:** Docker and Docker Compose.

```bash
git clone <your-repo-url>
cd customer-complaint-agent

cp backend/.env.example backend/.env

docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

The database is created and migrated automatically on first run.
