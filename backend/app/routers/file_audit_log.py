from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import crud, schemas
from ..database import get_db

router = APIRouter(
    prefix="/file-audit-log",
    tags=["file-audit-log"]
)

@router.get("/", response_model=List[schemas.FileAuditLog])
def read_file_audit_logs(
    client_id: Optional[int] = Query(None),
    convert_status: Optional[str] = Query(None),
    mapping_validation_status: Optional[str] = Query(None),
    row_validation_status: Optional[str] = Query(None),
    load_status: Optional[str] = Query(None),
    json_file_name: Optional[str] = Query(None),
    batch_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    logs = crud.get_file_audit_logs(
        db=db,
        client_id=client_id,
        convert_status=convert_status,
        mapping_validation_status=mapping_validation_status,
        row_validation_status=row_validation_status,
        load_status=load_status,
        json_file_name=json_file_name,
        batch_id=batch_id,
        skip=skip,
        limit=limit
    )
    return logs
