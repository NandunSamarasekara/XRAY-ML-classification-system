# XRAY ML System

[![CI](https://github.com/YOUR_USERNAME/XRAY-ML-system/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/XRAY-ML-system/actions/workflows/ci.yml)  
[![Python](https://img.shields.io/badge/python-3.10-blue)](https://www.python.org/)  
[![PyTorch](https://img.shields.io/badge/pytorch-2.1.0-red)](https://pytorch.org/)  
[![Node](https://img.shields.io/badge/node-20-green)](https://nodejs.org/)  
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://www.docker.com/)  
[![PostgreSQL](https://img.shields.io/badge/postgresql-15-blue)](https://www.postgresql.org/)  
[![Celery](https://img.shields.io/badge/celery-5-orange)](https://docs.celeryq.dev/)  
[![Redis](https://img.shields.io/badge/redis-7-red)](https://redis.io/)

---

## Table of Contents

- [Project Overview](#project-overview)  
- [Architecture](#architecture)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Project Structure](#project-structure)  
- [Setup Instructions](#setup-instructions)  
- [Running the Project](#running-the-project)  
- [Contributing](#contributing)  
- [License](#license)

---

## Project Overview

The **XRAY ML System** is a full-stack AI solution for chest X-ray analysis.  

**Key Goals:**

1. **Binary Classification** – Detect whether a chest X-ray shows any disease.  
2. **Multi-class Classification** – Identify the specific disease if present.  
3. **Comparison Tool** – Allow doctors to compare X-ray images for patient follow-ups.  

This system integrates **machine learning models, backend APIs, and a modern React frontend**, aimed for research and clinical decision support.

---

## Architecture

Doctor uploads X-ray → FastAPI Backend → Binary Classification Model → Multi-class Disease Classification Model → Prediction & Comparison Service → Frontend (React + Vite)  

**Diagram:**  
![System Diagram](docs/system_diagram.png)

---

## Features

- Binary disease detection (ML)  
- Multi-class disease classification (ML)  
- Ensemble model support (6-team member contributions)  
- Patient X-ray comparison interface  
- Async tasks with Celery + Redis  
- Dockerized backend + frontend + Celery  
- GitHub Actions CI for automated linting, dependency checks, and frontend build  

---

## Tech Stack

- **Backend:** Python, FastAPI  
- **Frontend:** React, Vite  
- **ML Framework:** PyTorch  
- **Database:** PostgreSQL  
- **Task Queue:** Celery  
- **Cache / Broker:** Redis  
- **Deployment:** Docker  
- **Email Service:** Gmail SMTP  

---

## Project Structure

![Project Structure](docs/Project_root.png)


---


---

## Setup Instructions

### 1. Clone Repository

```
git clone https://github.com/YOUR_USERNAME/XRAY-ML-system.git
cd XRAY-ML-system
git checkout develop
```

### 2. Backend Setup

```
cd backend
python -m venv .venv
.\.venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

### 3. ML setup

ML dependencies installed via backend requirements.txt.

Place dataset images in folders:

data/images_001/
data/images_002/
...
data/images_012/


(Images are ignored in GitHub for size reasons)

### 4.Frontend Setup
cd ../frontend
npm install
npm run dev    # Starts local development server


Access frontend at http://localhost:5173

### 5.Docker Setup
docker-compose up --build


Starts backend, frontend, and Celery workers

Access frontend at http://localhost:5173

### Running the project locally

Backend API:

cd backend
.\.venv\Scripts\activate
uvicorn app.main:app --reload


ML scripts:

cd ml/binary
python train.py   # Train binary model
python inference.py   # Test inference


Frontend:

cd frontend
npm run dev

## Testing

### Backend Testing

```bash
cd backend
$env:PYTHONPATH="."; pytest tests/test_auth.py
```

### Frontend Testing

```bash
cd frontend
npm test -- --run --environment jsdom --root src/pages/__tests__/AccountSettings.test.jsx
```

## Branching Strategy

- `main` – Production / Stable branch (protected)  
- `develop` – Active development branch  
- Each team member **must create their own branch** for their assigned module or task:  
  - Naming convention: `membername/<module-name>`  
    - Example: `Nandun/ml-binary`, `Venuja/backend-api`, `Chamith/frontend-ui`  

**Merge Policy:**  
1. Each member works only in their personal branch.  
2. Open Pull Request to `develop` when the task is ready.  
3. CI must pass (GitHub Actions).  
4. Peer review approval before merging.  
5. Periodically, `develop` merges into `main`.

---

### Contributing

Workflow:
1. Checkout `develop` and create your personal branch:

```bash
git checkout develop
git checkout -b membername/<module-name>
Create a feature branch from develop:

git checkout develop
git checkout -b feature/<your-feature-name>
```

Commit your work:

```
git add .
git commit -m "Add <feature description>"
git push -u origin feature/<your-feature-name>
```

Open a Pull Request to develop

CI must pass before merge

Team Tasks Example:

ML preprocessing & model training (binary + multi-class)

Backend endpoints & Celery tasks

Frontend pages & image comparison tool

Docker configuration & deployment

### License

This project is for academic use only.
Commercial usage requires explicit permission from the project team.
