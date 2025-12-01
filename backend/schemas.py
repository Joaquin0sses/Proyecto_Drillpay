from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    role_id: Optional[int] = None
    created_at: datetime
    class Config:
        orm_mode = True

class ClientBase(BaseModel):
    name: str
    email: str
    rut: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class InvoiceBase(BaseModel):
    amount: float
    issue_date: date
    due_date: date
    status: str = "PENDING"
    client_id: int
    document_number: Optional[str] = None
    type: Optional[str] = None
    account_number: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    pass

class Invoice(InvoiceBase):
    id: int
    file_path: Optional[str] = None
    created_at: datetime
    client: Optional[Client] = None # Include nested client data
    
    class Config:
        orm_mode = True

class PredictionBase(BaseModel):
    client_id: int
    risk_score: float

class Prediction(PredictionBase):
    id: int
    prediction_date: datetime
    class Config:
        orm_mode = True
