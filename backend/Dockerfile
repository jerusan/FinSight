# Base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y build-essential

RUN apt-get update && apt-get install -y \
    poppler-utils \
    tesseract-ocr \
    python3-pip

RUN apt-get update && apt-get install -y \
    libmagic1 \
    libmagic-dev \
    && apt-get clean

RUN pip install pdf2image pytesseract pillow

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire codebase
COPY . .

# Expose the FastAPI port
EXPOSE 8000

# Start the app using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
