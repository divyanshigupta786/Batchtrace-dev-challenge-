# BatchTrace Agent — Python FastAPI Microservice

High-performance deterministic food traceability, coordinate-based document parsing, and mass balance auditing service.

---

## 1. Features
- **Pydantic v2 Contracts**: Typed models matching the PostgreSQL 17-table relational schema.
- **Deterministic Trace Engine**: Forward graph traversal (Supplier &rarr; Ingredient Lot &rarr; Batches &rarr; Finished Goods &rarr; Customer Orders) and backward root cause analysis.
- **Mass Balance Audit**: Strict reconciliation comparing received quantities vs production consumption, isolating variances (e.g. 50 kg deficit on Lot L-204).
- **Coordinate-Preserving Document Parser**: Extracted fields retain source row and exact character range references.
- **OpenAPI / Swagger Documentation**: Interactive API documentation generated at `/docs`.

---

## 2. Quickstart

### Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### Run Tests
```bash
python backend/test_backend.py
```

### Start the FastAPI Server
```bash
python backend/main.py
# Or with uvicorn directly:
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive OpenAPI Swagger UI will be available at:
[http://localhost:8000/docs](http://localhost:8000/docs)

---

## 3. Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health, version, and seed entity counts |
| `POST` | `/api/trace/forward` | Forward graph traversal with mass balance reconciliation |
| `POST` | `/api/trace/backward` | Backward root cause analysis to suppliers |
| `POST` | `/api/extract` | Document extraction with coordinate parsing |
| `GET` | `/api/demo/entities` | Complete synthetic dataset for Meadow Pantry Products Inc. |
| `GET` | `/docs` | Interactive Swagger UI |
| `GET` | `/openapi.json` | OpenAPI v3 Specification |
