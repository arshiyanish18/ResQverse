from fastapi import APIRouter

router = APIRouter()


@router.post("/recommend")
def recommend_relocation(data: dict):
    return {
        "status": "NOT_CALCULATED",
        "message": "Relocation logic will be implemented later.",
        "input": data
    }