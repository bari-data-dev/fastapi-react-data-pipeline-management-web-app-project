from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import crud, schemas
from ..database import get_db

router = APIRouter(
    prefix="/transformation-log",
    tags=["transformation-log"]
)

@router.get("/", response_model=List[schemas.TransformationLog])
def read_transformation_logs(
    client_id: Optional[int] = Query(None),
    source_table: Optional[str] = Query(None),
    target_table: Optional[str] = Query(None),
    batch_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    logs = crud.get_transformation_logs(
        db=db,
        client_id=client_id,
        source_table=source_table,
        target_table=target_table,
        batch_id=batch_id,
        skip=skip,
        limit=limit
    )
    return logs
