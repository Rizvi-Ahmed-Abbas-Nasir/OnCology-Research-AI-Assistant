Oncology Research RAG Pipeline

🚀 Retrieval-Augmented Generation (RAG) for Oncology Research

This project implements an AI-powered Oncology Research Assistant that uses RAG (Retrieval-Augmented Generation) with Ollama Llama 3.2 to provide intelligent search and answers on oncology-related queries.

The system integrates:
✅ Next.js (Frontend & API)
✅ Node.js (Backend)
✅ FastAPI (FAISS-based vector search)
✅ FAISS (Vector storage & retrieval)
✅ MongoDB (Document storage)
Project Architecture


How It Works

1️⃣ User Inputs Oncology Research Query
2️⃣ Retrieval Step: FAISS searches the vector database for similar documents.
3️⃣ Augmentation Step: Relevant oncology documents retrieved from MongoDB.
4️⃣ Generation Step: Ollama Llama 3.2 generates a response based on retrieved data.
5️⃣ Response Sent to User
Key Features

✔️ Next.js UI
✔️ Custom API /api/OnCologyChat/ for RAG processing
✔️ Node.js Backend with MongoDB
✔️ FAISS for vector-based document retrieval
✔️ Python-to-JS pipeline for smooth integration
✔️ FastAPI for embedding & vector search
Installation
1️⃣ Clone the Repository

git clone https://github.com/yourusername/oncology-rag.git
cd oncology-rag

2️⃣ Install Dependencies
Frontend (Next.js)

cd frontend
npm install
npm run dev

Backend (Node.js)

cd backend
npm install
node index.js

Vector Search (FAISS + FastAPI)

cd vector-backend
pip install -r requirements.txt
uvicorn document_embedding_service:app --reload

API Endpoints
1️⃣ Add Oncology Research Document

POST /add-document

{
  "content": "Recent advancements in AI for cancer treatment..."
}

Response:

{
  "message": "Document added successfully",
  "document_id": "65dff2345abc"
}

2️⃣ Query the Oncology Research Database

POST /query

{
  "query": "Latest AI research on breast cancer",
  "top_k": 3
}

Response:

{
  "documents": [
    "Deep learning models improving cancer diagnosis...",
    "AI-driven precision medicine for oncology...",
    "New research in tumor classification using ML..."
  ]
}

Deployment Strategy
Frontend (Vercel)

    Deploy Next.js UI on Vercel.

Backend (Cloud VPS or Docker)

    Deploy Node.js backend on AWS/DigitalOcean.

FAISS & FastAPI (Docker)

    Use Docker Compose for FAISS vector search service.
