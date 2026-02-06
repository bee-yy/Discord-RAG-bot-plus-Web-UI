# Project RAG Bot

<img src="discord-bot/readmeLine.png" alt="divider" width="100%" />

## Overview
A Retrieval-Augmented Generation (RAG) assistant with a FastAPI backend, a Discord bot interface, and a React/Tailwind web UI. The backend indexes local knowledge base files and answers questions via Groq-hosted Llama 3.3 with HuggingFace embeddings. The Discord bot forwards user questions to the backend and returns rich responses with sources and feedback buttons.

<img src="discord-bot/readmeLine.png" alt="divider" width="100%" />

## User Flow
<img src="frontend/src/assets/User%20Flow_%20discord-bot.jpg" alt="User Flow" width="100%" />

<img src="discord-bot/readmeLine.png" alt="divider" width="100%" />

## Final Design
<img src="frontend/src/assets/final%20design.jpg" alt="Final Design" width="100%" />

<img src="discord-bot/readmeLine.png" alt="divider" width="100%" />

## Architecture
- `backend/`: FastAPI RAG API with LlamaIndex, Groq LLM, and vector storage.
- `discord-bot/`: Discord bot that calls the API and collects feedback.
- `frontend/`: React + Vite + Tailwind client UI.




<img src="discord-bot/readmeLine.png" alt="divider" width="100%" />

## Tech Stack
- Backend: FastAPI, LlamaIndex, Groq, HuggingFace Embeddings
- Bot: discord.py, aiohttp
- Frontend: React, Vite, Tailwind CSS

<img src="discord-bot/readmeLine.png" alt="divider" width="100%" />

## Getting Started

### 1) Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
Create a `.env` in `backend/`:
```bash
GROQ_API_KEY=your_groq_api_key
```
Run the API:
```bash
uvicorn app:app --reload
```

### 2) Discord Bot
```bash
cd discord-bot
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
Create a `.env` in `discord-bot/`:
```bash
DISCORD_TOKEN=your_discord_bot_token
BACKEND_URL=http://127.0.0.1:8000
```
Run the bot:
```bash
python main.py
```

### 3) Frontend
```bash
cd frontend
npm install
npm run dev
```

<img src="discord-bot/readmeLine.png" alt="divider" width="100%" />

## Project Structure
```
backend/
  app.py
  knowledge_base/
  storage/
  requirements.txt

discord-bot/
  main.py
  requirements.txt

frontend/
  src/
  package.json
```

<img src="discord-bot/readmeLine.png" alt="divider" width="100%" />

## Notes
- Add or update files in `backend/knowledge_base` to expand the assistant's knowledge.
- Keep `.env` files out of version control and rotate keys if exposed.
