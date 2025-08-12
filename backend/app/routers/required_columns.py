from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.schemas import BatchRequiredColumnSaveRequest
from app.models import ClientReference
import re 

from .. import crud, schemas
from ..database import get_db

router = APIRouter(
    prefix="/required-columns",
    tags=["required-columns"]
)


@router.get("/versions", response_model=schemas.MappingVersionList)
def get_required_column_versions(client_id: int = Query(...), db: Session = Depends(get_db)):
    """
    Ambil daftar distinct required_column_version untuk client tertentu
    """
    versions = crud.get_distinct_required_column_versions(db, client_id)
    return {"versions": versions}

@router.post("/", response_model=schemas.RequiredColumn)
def create_required_column(required_column: schemas.RequiredColumnCreate, db: Session = Depends(get_db)):
    return crud.create_required_column(db, required_column)

@router.get("/{required_id}", response_model=schemas.RequiredColumn)
def read_required_column(required_id: int, db: Session = Depends(get_db)):
    db_required_column = crud.get_required_column(db, required_id)
    if db_required_column is None:
        raise HTTPException(status_code=404, detail="Required column not found")
    return db_required_column

@router.get("/", response_model=List[schemas.RequiredColumn])
def read_required_columns(
    skip: int = 0,
    limit: int = 100,
    client_id: Optional[int] = Query(None),  # NEW: filter opsional
    required_column_version: Optional[str] = Query(None),  # NEW: filter opsional
    logical_source_file: Optional[str] = Query(None),  # NEW: filter opsional
    db: Session = Depends(get_db)
):
    """
    Ambil list required_columns dengan opsi filter:
    - client_id
    - required_column_version
    - logical_source_file
    """
    return crud.get_required_columns(
        db,
        skip=skip,
        limit=limit,
        client_id=client_id,
        required_column_version=required_column_version,
        logical_source_file=logical_source_file
    )

@router.put("/{required_id}", response_model=schemas.RequiredColumn)
def update_required_column(required_id: int, required_column: schemas.RequiredColumnUpdate, db: Session = Depends(get_db)):
    updated = crud.update_required_column(db, required_id, required_column)
    if updated is None:
        raise HTTPException(status_code=404, detail="Required column not found")
    return updated

@router.delete("/{required_id}", response_model=schemas.RequiredColumn)
def delete_required_column(required_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_required_column(db, required_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail="Required column not found")
    return deleted

@router.post("/batch_save")
def save_batch_required_columns(data: BatchRequiredColumnSaveRequest, db: Session = Depends(get_db)):
    client_exists = db.query(ClientReference).filter(ClientReference.client_id == data.client_id).first()
    if not client_exists:
        raise HTTPException(status_code=400, detail="client_id not found")

    m = re.match(r'^v(\d+)$', data.required_column_version)
    if not m:
        raise HTTPException(status_code=400, detail="Version format invalid, must be v<number>")

    max_ver_num = crud.get_max_required_column_version_number(db, data.client_id)
    new_ver_num = int(m.group(1))
    if max_ver_num == 0 and new_ver_num != 1:
        raise HTTPException(status_code=400, detail="First version must be v1")
    
    # Jika sudah ada versi, cek harus max + 1
    if max_ver_num > 0 and new_ver_num != max_ver_num + 1:
        raise HTTPException(status_code=400, detail=f"config_version must be v{max_ver_num + 1}")

    try:
        crud.batch_save_required_columns(
            db,
            client_id=data.client_id,
            required_column_version=data.required_column_version,
            rows=[rc.dict() for rc in data.required_columns]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal Server Error")

    return {"detail": "Batch saved successfully", "required_column_version": data.required_column_version}
