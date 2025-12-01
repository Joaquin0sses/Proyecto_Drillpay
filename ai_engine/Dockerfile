FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run training script to ensure model exists
RUN python train.py

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5001"]
