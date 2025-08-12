from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.schemas import BatchMappingSaveRequest
from app.models import ClientReference
import re

from .. import crud, schemas
from ..database import get_db

router = APIRouter(
    prefix="/column-mapping",
    tags=["column-mapping"]
)

@router.get("/versions", response_model=schemas.MappingVersionList)
def get_mapping_versions(client_id: int = Query(...), db: Session = Depends(get_db)):
    versions = crud.get_distinct_mapping_versions(db, client_id)
    return {"versions": versions}

@router.post("/", response_model=schemas.ColumnMapping)
def create_column_mapping(column_mapping: schemas.ColumnMappingCreate, db: Session = Depends(get_db)):
    return crud.create_column_mapping(db, column_mapping)

@router.get("/{mapping_id}", response_model=schemas.ColumnMapping)
def read_column_mapping(mapping_id: int, db: Session = Depends(get_db)):
    db_mapping = crud.get_column_mapping(db, mapping_id)
    if db_mapping is None:
        raise HTTPException(status_code=404, detail="Column mapping not found")
    return db_mapping

@router.get("/", response_model=List[schemas.ColumnMapping])
def read_column_mappings(
    client_id: Optional[int] = Query(None, description="Filter by client_id"),
    mapping_version: Optional[str] = Query(None, description="Filter by mapping_version"),
    logical_source_file: Optional[str] = Query(None, description="Filter by logical_source_file"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.get_column_mappings(
        db,
        client_id=client_id,
        mapping_version=mapping_version,
        logical_source_file=logical_source_file,
        skip=skip,
        limit=limit
    )

@router.put("/{mapping_id}", response_model=schemas.ColumnMapping)
def update_column_mapping(mapping_id: int, column_mapping: schemas.ColumnMappingUpdate, db: Session = Depends(get_db)):
    updated = crud.update_column_mapping(db, mapping_id, column_mapping)
    if updated is None:
        raise HTTPException(status_code=404, detail="Column mapping not found")
    return updated

@router.delete("/{mapping_id}", response_model=schemas.ColumnMapping)
def delete_column_mapping(mapping_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_column_mapping(db, mapping_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail="Column mapping not found")
    return deleted

@router.post("/batch_save")
def save_batch_mapping(data: BatchMappingSaveRequest, db: Session = Depends(get_db)):
    # Cek client_id ada
    client_exists = db.query(ClientReference).filter(ClientReference.client_id == data.client_id).first()
    if not client_exists:
        raise HTTPException(status_code=400, detail="client_id not found")

    # Validasi versi baru harus max + 1
    max_ver_num = crud.get_max_mapping_version_number(db, data.client_id)
    m = re.match(r'v(\d+)', data.mapping_version)
    if not m:
        raise HTTPException(status_code=400, detail="mapping_version invalid format")
    new_ver_num = int(m.group(1))

    if max_ver_num == 0 and new_ver_num != 1:
        raise HTTPException(status_code=400, detail="First version must be v1")
    # Jika sudah ada versi, cek harus max + 1
    if max_ver_num > 0 and new_ver_num != max_ver_num + 1:
        raise HTTPException(status_code=400, detail=f"config_version must be v{max_ver_num + 1}")

    # Validasi tiap row sudah lewat validator Pydantic

    # Simpan batch
    try:
        crud.batch_save_column_mapping(
            db, 
            client_id=data.client_id, 
            mapping_version=data.mapping_version, 
            rows=[m.dict() for m in data.mappings])
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

    return {"detail": "Batch saved successfully", "mapping_version": data.mapping_version}



