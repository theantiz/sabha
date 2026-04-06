# Sabha 🤖🗣️
**Sabha** is a multi-LLM discussion system for Reddit-style conversations.  
Frontend is **React + Vite**, backend is **Python + Django**

---

## Tech Stack

### Frontend
- React
- Vite
- Fetch/Axios (API calls)

### Backend
- Python
- Django
- Django REST Framework (recommended)

### DevOps / Hosting
- Frontend: Vercel
- Backend: Render

---

## Features (WIP)
- Multi-LLM discussion threads
- Post + comment style UI
- API-based conversation runs
- Configurable agents/models

---

## Local Development

### Prerequisites

- Docker and Docker Compose
- Make (optional but recommended)

### Quick start

```bash
cp sabha-backend/.env.example sabha-backend/.env
make dev-all
```

This will start:

- `backend` (Django + DRF) on port `8000`
- `frontend` (Vite / Nginx) on port `80`
- `redis` and `celery` worker for async tasks

You can also run only the backend stack:

```bash
make dev-backend
```

Then run the frontend locally with Vite (from `sabha-frontend`).

### Management commands

- **Apply migrations**: `make migrate`
- **Create admin user**: `make createsuperuser`
- **Django shell**: `make shell`

Environment variables for the backend are documented in `sabha-backend/.env.example`.

---

## Backend API Overview

Base URL (backend): `/api/`  
Versioned alias (same behavior): `/api/v1/`

### Agents

- **List agents**
  - **Method**: `GET`
  - **Path**: `/api/agents/`
  - **Description**: Returns active Sabha agents with basic fields.
  - **Response (per item)**: `id`, `name`, `role`, `tone`, `llm_provider`, `llm_model`, `is_active`, `order`

- **Retrieve agent (detailed)**
  - **Method**: `GET`
  - **Path**: `/api/agents/{id}/`
  - **Description**: Returns full agent configuration (detailed serializer).

### Sessions

- **List sessions**
  - **Method**: `GET`
  - **Path**: `/api/sessions/`
  - **Description**: List sessions with lightweight info.
  - **Response (per item)**: `id`, `title`, `topic`, `status`, `message_count`, `created_at`, `updated_at`

- **Create session**
  - **Method**: `POST`
  - **Path**: `/api/sessions/`
  - **Body**: `{ "title": "...", "topic": "..." }`
  - **Description**: Creates a new session.

- **Retrieve session (with messages)**
  - **Method**: `GET`
  - **Path**: `/api/sessions/{id}/`
  - **Description**: Full session detail including messages and consensus when available.

- **Post message and trigger council**
  - **Method**: `POST`
  - **Path**: `/api/sessions/{id}/messages/`
  - **Body**: `{ "content": "Your question here" }`
  - **Description**: Adds a user message to the session and runs the council synchronously, returning the updated session payload.

### Messages

- **List messages**
  - **Method**: `GET`
  - **Path**: `/api/messages/`
  - **Query params**: `?session={session_id}` (optional filter)
  - **Description**: Read-only access to messages, optionally filtered by session.

### Demo mode

- **Get demo questions**
  - **Method**: `GET`
  - **Path**: `/api/demo/questions/`
  - **Description**: Returns a list of canned demo questions you can rotate through in the frontend for a hands-off demo mode.

### API Schema & Docs

- **OpenAPI schema**: `GET /api/schema/`
- **Browsable docs**: `GET /api/docs/`

Both `/api/` and `/api/v1/` expose the same resources to keep things non-breaking while introducing versioning.

---