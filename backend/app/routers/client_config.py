from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.schemas import BatchConfigClientSaveRequest
from app.models import ClientReference
import re 

from .. import crud, schemas
from ..database import get_db

router = APIRouter(
    prefix="/client-config",
    tags=["client-config"]
)


@router.get("/versions", response_model=schemas.ConfigClientVersionList)
def get_client_config_versions(client_id: int = Query(...), db: Session = Depends(get_db)):
    versions = crud.get_distinct_config_versions(db, client_id)
    # Kalau tidak ada versi, return list kosong, jangan raise error 404
    return {"versions": versions}

@router.post("/", response_model=schemas.ClientConfig)
def create_client_config(client_config: schemas.ClientConfigCreate, db: Session = Depends(get_db)):
    return crud.create_client_config(db, client_config)

@router.get("/{config_id}", response_model=schemas.ClientConfig)
def read_client_config(config_id: int, db: Session = Depends(get_db)):
    db_config = crud.get_client_config(db, config_id)
    if db_config is None:
        raise HTTPException(status_code=404, detail="Client config not found")
    return db_config

@router.get("/", response_model=List[schemas.ClientConfig])
def read_client_configs(
    skip: int = 0,
    limit: int = 100,
    client_id: Optional[int] = Query(None),
    config_version: Optional[str] = Query(None),
    logical_source_file: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return crud.get_client_configs(
        db,
        client_id=client_id,
        config_version=config_version,
        logical_source_file=logical_source_file,
        skip=skip,
        limit=limit
    )

@router.put("/{config_id}", response_model=schemas.ClientConfig)
def update_client_config(config_id: int, client_config: schemas.ClientConfigUpdate, db: Session = Depends(get_db)):
    updated = crud.update_client_config(db, config_id, client_config)
    if updated is None:
        raise HTTPException(status_code=404, detail="Client config not found")
    return updated

@router.delete("/{config_id}", response_model=schemas.ClientConfig)
def delete_client_config(config_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_client_config(db, config_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail="Client config not found")
    return deleted

@router.post("/batch_save")
def save_batch_client_config(data: schemas.BatchConfigClientSaveRequest, db: Session = Depends(get_db)):
    client_exists = db.query(ClientReference).filter(ClientReference.client_id == data.client_id).first()
    if not client_exists:
        raise HTTPException(status_code=400, detail="client_id not found")

    m = re.match(r'^v(\d+)$', data.config_version)
    if not m:
        raise HTTPException(status_code=400, detail="config_version format invalid, must be v<number>")

    max_ver_num = crud.get_max_config_version_number(db, data.client_id)
    new_ver_num = int(m.group(1))
    # Jika belum ada versi sama sekali (max_ver_num == 0), maka versi baru harus v1
    if max_ver_num == 0 and new_ver_num != 1:
        raise HTTPException(status_code=400, detail="First version must be v1")
    
    # Jika sudah ada versi, cek harus max + 1
    if max_ver_num > 0 and new_ver_num != max_ver_num + 1:
        raise HTTPException(status_code=400, detail=f"config_version must be v{max_ver_num + 1}")

    try:
        crud.batch_save_client_config(
            db,
            client_id=data.client_id,
            config_version=data.config_version,
            rows=[cc.dict() for cc in data.client_configs]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal Server Error")

    return {"detail": "Batch saved successfully", "config_version": data.config_version}