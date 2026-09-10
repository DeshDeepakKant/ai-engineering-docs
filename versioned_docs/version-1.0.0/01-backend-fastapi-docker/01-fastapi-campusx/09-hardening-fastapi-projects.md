---
id: 09-hardening-fastapi-projects
title: "Improving & Hardening a FastAPI Project: Architecture & CORS"
sidebar_label: "09. Hardening FastAPI Projects"
sidebar_position: 9
description: "Production engineering patterns: APIRouter modularization, pydantic-settings configuration, CORS middleware, and global exception handlers."
tags:
  - fastapi
  - backend
  - python
  - campusx
---

# 📹 Improving & Hardening a FastAPI Project: Architecture & CORS

<div className="video-card" style={{border: '1px solid #30363d', borderRadius: '8px', padding: '16px', marginBottom: '24px', background: 'rgba(56, 139, 253, 0.05)'}}>
  <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
    <div><strong>Instructor:</strong> Nitish Singh (CampusX)</div>
    <div><strong>Duration:</strong> 26m 40s</div>
    <div><strong>Course:</strong> Module 1 - Production Backend & Docker</div>
    <div><strong>Watch Link:</strong> <a href="https://www.youtube.com/watch?v=M17qwKnmG38" target="_blank" rel="noopener noreferrer">YouTube Lecture ↗</a></div>
  </div>
</div>


## 📌 Executive Summary

Building a single-file prototype is easy, but enterprise AI projects require:
1. **Separation of Concerns:** Splitting endpoints logically using `APIRouter`.
2. **Centralized Configuration:** Strict environment variable management using `pydantic-settings`.
3. **Cross-Origin Resource Sharing (CORS):** Allowing browser clients (React, Next.js, Vue) to consume the API safely.
4. **Resilient Error Envelopes:** Intercepting unhandled exceptions and returning consistent JSON envelopes.

---

## 🏗️ Architecture: Production File Hierarchy

```text
api_project/
├── app/
│   ├── __init__.py
│   ├── main.py                  # App instantiation, middlewares, routers
│   ├── config.py                # Pydantic Settings & ENV variables
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── health.py            # /healthz and /readyz probes
│   │   └── inference.py         # /v1/predict endpoints
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── prediction.py        # Pydantic models
│   └── services/
│       ├── __init__.py
│       └── model_service.py     # Heavy inference & ML logic
├── requirements.txt
└── Dockerfile
```

---

## 💻 Practical Code: Configuration, Routers & Middleware

### 1. `config.py`: Strict Environment Management
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Production AI Inference API"
    environment: str = "production"
    model_path: str = "artifacts/model.joblib"
    allowed_origins: list[str] = ["http://localhost:3000", "https://app.example.com"]
    max_batch_size: int = 64

    class Config:
        env_file = ".env"

settings = Settings()
```

### 2. `routers/inference.py`: Modular Routes
```python
from fastapi import APIRouter, status
from pydantic import BaseModel

router = APIRouter(prefix="/v1", tags=["Inference"])

class InputSchema(BaseModel):
    text: str

@router.post("/predict", status_code=status.HTTP_200_OK)
async def run_inference(payload: InputSchema):
    return {"result": f"Processed: {payload.text}"}
```

### 3. `main.py`: Integrating CORS & Router
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import inference

app = FastAPI(title=settings.app_name)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Router
app.include_router(inference.router)
```

---

## 💡 Production Best Practices & Tips

:::tip Restrict CORS in Production
Never leave `allow_origins=["*"]` in production if your API handles credentials or authentication cookies. Explicitly specify your frontend domain origins.
:::

