---
title: Azure Optimizer
emoji: ☁️
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Azure Optimizer Frontend

A full React/Next.js frontend for Azure Optimizer using the AegisOps-style dark SOC/product design.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Optional backend connection

The UI works in demo mode by default. To connect a backend endpoint:

```bash
NEXT_PUBLIC_API_BASE=http://localhost:8000 npm run dev
```

The UI will attempt `POST /audit` and expects JSON shaped like:

```json
{
  "score": 78,
  "resources": 142,
  "issues": 28,
  "savings": 3240,
  "findings": [],
  "report": "..."
}
```

## Hugging Face Spaces

Use Docker Space or Node/Next-compatible hosting. For a Docker Space, add a Dockerfile that runs:

```bash
npm install
npm run build
npm run start
```
