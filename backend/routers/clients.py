from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import database, models, schemas, auth

router = APIRouter(
    prefix="/clients",
    tags=["clients"]
)

@router.get("/", response_model=List[schemas.Client])
def read_clients(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    clients = db.query(models.Client).offset(skip).limit(limit).all()
    return clients

@router.post("/", response_model=schemas.Client)
def create_client(client: schemas.ClientCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_client = models.Client(**client.dict())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client
