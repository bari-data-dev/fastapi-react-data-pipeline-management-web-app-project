from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.schemas import BatchTransformationConfigSaveRequest
from app.models import ClientReference
import re

from .. import crud, schemas
from ..database import get_db

router = APIRouter(
    prefix="/transformation-config",
    tags=["transformation-config"]
)

@router.get("/versions", response_model=schemas.TransformationConfigVersionList)
def get_transform_versions(client_id: int = Query(...), db: Session = Depends(get_db)):
    versions = crud.get_distinct_transform_versions(db, client_id)
    return {"versions": versions}

@router.post("/", response_model=schemas.TransformationConfig)
def create_transformation_config(transformation_config: schemas.TransformationConfigCreate, db: Session = Depends(get_db)):
    return crud.create_transformation_config(db, transformation_config)

@router.get("/", response_model=List[schemas.TransformationConfig])
def read_transform_configs(
    skip: int = 0,
    limit: int = 100,
    client_id: Optional[int] = Query(None),
    transform_version: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return crud.get_transformation_configs(
        db,
        skip=skip,
        limit=limit,
        client_id=client_id,
        transform_version=transform_version
    )

@router.get("/", response_model=List[schemas.TransformationConfig])
def read_transformation_configs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_transformation_configs(db, skip=skip, limit=limit)

@router.put("/{transform_id}", response_model=schemas.TransformationConfig)
def update_transformation_config(transform_id: int, transformation_config: schemas.TransformationConfigUpdate, db: Session = Depends(get_db)):
    updated = crud.update_transformation_config(db, transform_id, transformation_config)
    if updated is None:
        raise HTTPException(status_code=404, detail="Transformation config not found")
    return updated

@router.delete("/{transform_id}", response_model=schemas.TransformationConfig)
def delete_transformation_config(transform_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_transformation_config(db, transform_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail="Transformation config not found")
    return deleted

@router.post("/batch_save")
def save_batch_transformation_config(data: BatchTransformationConfigSaveRequest, db: Session = Depends(get_db)):
    client_exists = db.query(ClientReference).filter(ClientReference.client_id == data.client_id).first()
    if not client_exists:
        raise HTTPException(status_code=400, detail="client_id not found")

    m = re.match(r'^v(\d+)$', data.transform_version)
    if not m:
        raise HTTPException(status_code=400, detail="Version format invalid, must be v<number>")

    max_ver_num = crud.get_max_transform_version_number(db, data.client_id)
    new_ver_num = int(m.group(1))
    if new_ver_num != max_ver_num + 1:
        raise HTTPException(status_code=400, detail=f"transform_version must be v{max_ver_num + 1}")

    try:
        crud.batch_save_transformation_config(
            db,
            client_id=data.client_id,
            transform_version=data.transform_version,
            rows=[tc.dict() for tc in data.transformation_configs]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal Server Error")

    return {"detail": "Batch saved successfully", "transform_version": data.transform_version}

