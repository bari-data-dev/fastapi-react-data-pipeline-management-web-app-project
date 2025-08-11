from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas
from ..database import get_db

router = APIRouter(
    prefix="/client-reference",
    tags=["client-reference"]
)

@router.post("/", response_model=schemas.ClientReference)
def create_client_reference(client_ref: schemas.ClientReferenceCreate, db: Session = Depends(get_db)):
    db_client = crud.get_client_reference_by_schema(db, client_ref.client_schema)
    if db_client:
        raise HTTPException(status_code=400, detail="Client schema already registered")
    return crud.create_client_reference(db, client_ref)

@router.get("/{client_id}", response_model=schemas.ClientReference)
def read_client_reference(client_id: int, db: Session = Depends(get_db)):
    db_client = crud.get_client_reference(db, client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client reference not found")
    return db_client

@router.get("/", response_model=List[schemas.ClientReference])
def read_client_references(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    clients = crud.get_client_references(db, skip=skip, limit=limit)
    return clients

@router.put("/{client_id}", response_model=schemas.ClientReference)
def update_client_reference(client_id: int, client_ref: schemas.ClientReferenceUpdate, db: Session = Depends(get_db)):
    updated = crud.update_client_reference(db, client_id, client_ref)
    if updated is None:
        raise HTTPException(status_code=404, detail="Client reference not found")
    return updated

@router.delete("/{client_id}", response_model=schemas.ClientReference)
def delete_client_reference(client_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_client_reference(db, client_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail="Client reference not found")
    return deleted
