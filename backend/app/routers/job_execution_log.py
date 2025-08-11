from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import crud, schemas
from ..database import get_db

router = APIRouter(
    prefix="/job-execution-log",
    tags=["job-execution-log"]
)

@router.get("/", response_model=List[schemas.JobExecutionLog])
def read_job_execution_logs(
    client_id: Optional[int] = Query(None),
    file_name: Optional[str] = Query(None),
    batch_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    logs = crud.get_job_execution_logs(
        db=db,
        client_id=client_id,
        file_name=file_name,
        batch_id=batch_id,
        skip=skip,
        limit=limit
    )
    return logs
