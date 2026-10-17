"""
BatchTrace Agent — FastAPI Microservice Entrypoint
Provides high-performance typed endpoints for deterministic traceability,
mass balance reconciliation, and document extraction.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from schemas import (
    ForwardTraceRequest,
    ForwardTraceResponse,
    BackwardTraceRequest,
    BackwardTraceResponse,
    DocumentExtractionRequest,
    DocumentExtractionResponse,
)
from engine import (
    DeterministicTraceEngine,
    DEMO_SUPPLIERS,
    DEMO_INGREDIENT_LOTS,
    DEMO_BATCHES,
    DEMO_FINISHED_LOTS,
    DEMO_ORDERS,
)

app = FastAPI(
    title="BatchTrace Agent Engine API",
    description="High-performance deterministic food traceability, document coordinate extraction, and mass-balance auditing API.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = DeterministicTraceEngine()


@app.get("/health", tags=["System"])
def health_check():
    """Returns system status, engine version, and database readiness."""
    return {
        "status": "healthy",
        "service": "BatchTrace Deterministic Python Engine",
        "version": "1.0.0",
        "database_entities": {
            "suppliers": len(DEMO_SUPPLIERS),
            "ingredient_lots": len(DEMO_INGREDIENT_LOTS),
            "production_batches": len(DEMO_BATCHES),
            "finished_lots": len(DEMO_FINISHED_LOTS),
            "customer_orders": len(DEMO_ORDERS),
        },
    }


@app.post("/api/trace/forward", response_model=ForwardTraceResponse, tags=["Traceability"])
def trace_forward(req: ForwardTraceRequest):
    """
    Executes deterministic forward graph traversal from an ingredient lot.
    Reconciles consumed quantities across production batches and isolates affected customer orders.
    """
    try:
        return engine.trace_forward(req.lot_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/trace/backward", response_model=BackwardTraceResponse, tags=["Traceability"])
def trace_backward(req: BackwardTraceRequest):
    """
    Executes deterministic backward root analysis from a finished product lot or customer order
    back to the manufacturing batches, consumed ingredient lots, and primary suppliers.
    """
    try:
        return engine.trace_backward(req.target_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/extract", response_model=DocumentExtractionResponse, tags=["Document Processing"])
def extract_document(req: DocumentExtractionRequest):
    """
    Ingests text/tabular source data, identifies document category,
    and extracts structured entities with precise source row and character coordinates.
    """
    try:
        return engine.extract_document(req.filename, req.raw_text, req.uploader_name)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@app.get("/api/demo/entities", tags=["Database & Seed"])
def get_demo_entities():
    """Returns the complete synthetic dataset for Meadow Pantry Products Inc."""
    return {
        "suppliers": DEMO_SUPPLIERS,
        "ingredient_lots": DEMO_INGREDIENT_LOTS,
        "production_batches": DEMO_BATCHES,
        "finished_lots": DEMO_FINISHED_LOTS,
        "customer_orders": DEMO_ORDERS,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
