from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, Date, DateTime, Text, Float
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    permissions = Column(Text)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role_id = Column(Integer, ForeignKey("roles.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    role = relationship("Role")

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    rut = Column(String, unique=True, index=True)
    phone = Column(String)
    address = Column(String)
    city = Column(String)
    country = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    invoices = relationship("Invoice", back_populates="client")

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    document_number = Column(String, index=True)
    amount = Column(Float)
    issue_date = Column(Date)
    due_date = Column(Date)
    status = Column(String, default="PENDING") # PAID, PENDING, OVERDUE
    type = Column(String)
    account_number = Column(String)
    file_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    client = relationship("Client", back_populates="invoices")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    type = Column(String)
    sent_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="SENT")

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    risk_score = Column(DECIMAL(5, 4))
    prediction_date = Column(DateTime, default=datetime.utcnow)
    
    client = relationship("Client")

class EmailTemplate(Base):
    __tablename__ = "email_templates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, default="default")
    subject = Column(String, default="Recordatorio de Pago")
    body = Column(Text, default="Estimado {cliente},\n\nLe recordamos que tiene facturas pendientes por un total de {monto}.\n\nAtentamente,\nDrillPay")
    include_table = Column(Integer, default=0) # 0=False, 1=True (using Integer for SQLite compatibility if needed, though Boolean is fine)
