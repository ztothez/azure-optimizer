# Azure Optimizer ☁️

AI-powered multi-agent infrastructure analysis platform that reviews Terraform configurations and operational metrics to identify configuration drift, resource waste, optimization opportunities, and infrastructure improvements through AI-assisted reporting.

## Live Demo

Hugging Face Space:
https://ztothez-azure-optimizer.hf.space/

## Overview

Azure Optimizer is a modern infrastructure analysis dashboard inspired by SOC-style operational tooling and AI-assisted cloud optimization workflows.

The project combines:
- infrastructure configuration analysis
- operational metric analysis
- AI-assisted reporting
- multi-agent orchestration
- interactive React dashboard visualization

The UI was designed with a dark enterprise/SOC aesthetic inspired by modern cloud security and infrastructure platforms.

---

## Features

- Multi-agent infrastructure analysis workflow
- Terraform configuration inspection
- Operational telemetry visualization
- Infrastructure health scoring
- Cost optimization recommendations
- AI-assisted audit reporting
- Interactive React/Next.js dashboard
- Hugging Face Space deployment support
- Demo-mode backend simulation

---

## Dashboard Metrics

The dashboard visualizes:
- resource inventory
- infrastructure health
- CPU / memory / disk / bandwidth telemetry
- issue severity distribution
- optimization recommendations
- recent environment analysis
- infrastructure findings
- operational scoring

---

## Tech Stack

### Frontend
- React
- Next.js
- TypeScript
- Tailwind CSS

### Backend / AI
- Python
- Anthropic API
- Multi-Agent Workflows
- Terraform Analysis
- JSON Metrics Pipeline

### Infrastructure
- Docker
- Hugging Face Spaces

---

## Run Locally

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

## Optional Backend Connection

The UI runs in demo mode by default.

To connect a backend API:

```bash
NEXT_PUBLIC_API_BASE=http://localhost:8000 npm run dev
```

Expected API response:

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

---

## Hugging Face Space Configuration

This project is configured for Hugging Face Docker Spaces.

Metadata:

```yaml
title: Azure Optimizer
emoji: ☁️
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
```

---

## Project Goal

The goal of Azure Optimizer is to explore how AI-assisted infrastructure analysis and operational telemetry can be combined into practical engineering workflows for cloud optimization, governance analysis, and operational visibility.
