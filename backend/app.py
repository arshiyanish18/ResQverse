from fastapi import FastAPI
from routes.vulnerability import router as vulnerability_router
from routes.relocation import router as relocation_router

app = FastAPI(title="RESQ Backend")


app.include_router(
    vulnerability_router,
    prefix="/api/vulnerability"
)

app.include_router(
    relocation_router,
    prefix="/api/relocation"
)


@app.get("/")
def home():
    return {
        "message": "RESQ Backend is running"
    }