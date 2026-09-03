from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.vulnerability import router as vulnerability_router
from routes.relocation import router as relocation_router
from routes.prediction import router as prediction_router

app = FastAPI(title="RESQ Backend")

app.add_middleware(
    CORSMiddleware,
   allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://res-qverse-nu.vercel.app"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    vulnerability_router,
    prefix="/api/vulnerability"
)

app.include_router(
    relocation_router,
    prefix="/api/relocation"
)

app.include_router(
    prediction_router,
    prefix="/api/prediction"
)


@app.get("/")
def home():
    return {
        "message": "RESQ Backend is running"
    }