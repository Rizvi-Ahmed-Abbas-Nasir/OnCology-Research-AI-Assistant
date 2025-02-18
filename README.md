# Oncology Research RAG (Retrieval-Augmented Generation)

This project implements an AI-powered **Oncology Research Assistant** utilizing **Retrieval-Augmented Generation (RAG)** with **Ollama Llama 3.2** to provide intelligent search and responses for oncology-related queries.

## 🚀 Project Overview

The system integrates multiple technologies to facilitate document retrieval and AI-generated responses based on relevant oncology research papers.

### 🔹 Tech Stack
✅ **Frontend:** Next.js (UI & API Integration)  
✅ **Backend:** Node.js (API & Data Handling)  
✅ **Database:** MongoDB (Document Storage)  
✅ **Vector Search:** FAISS (Efficient Similarity Search)  
✅ **Embedding & Search API:** FastAPI (FAISS-based vector search)  
✅ **AI Model:** Ollama Llama 3.2 (Text Embeddings & Response Generation)  

---

## 🏗️ **Project Architecture**

1️⃣ **User Input:** The user submits an oncology research query.  
2️⃣ **Retrieval Step:** FAISS searches the vector database for semantically similar documents.  
3️⃣ **Augmentation Step:** Relevant oncology documents are retrieved from MongoDB.  
4️⃣ **Generation Step:** Ollama Llama 3.2 generates a response based on retrieved data.  
5️⃣ **Response Sent to User** with relevant oncology research insights.  

---

## ⚙️ **Installation & Setup**

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/yourusername/oncology-rag.git
cd oncology-rag
```

### 2️⃣ Install Dependencies

#### **Frontend (Next.js)**
```sh
cd frontend
npm install
npm run dev
```

#### **Backend (Node.js + MongoDB)**
```sh
cd backend
npm install
node index.js
```

#### **Vector Search (FAISS + FastAPI)**
```sh
cd vector-backend
pip install -r requirements.txt
uvicorn document_embedding_service:app --reload
```

---

## 🔗 **API Endpoints**

### 📌 **1. Add an Oncology Research Document**
#### **POST `/add-document`**
```json
{
  "content": "Recent advancements in AI for cancer treatment..."
}
```
**Response:**
```json
{
  "message": "Document added successfully",
  "document_id": "65dff2345abc"
}
```

### 📌 **2. Query the Oncology Research Database**
#### **POST `/query`**
```json
{
  "query": "Latest AI research on breast cancer",
  "top_k": 3
}
```
**Response:**
```json
{
  "documents": [
    "Deep learning models improving cancer diagnosis...",
    "AI-driven precision medicine for oncology...",
    "New research in tumor classification using ML..."
  ]
}
```

---

## 🚀 **Deployment Strategy**

### **Frontend Deployment (Vercel)**
- Deploy the **Next.js UI** on [Vercel](https://vercel.com/).

### **Backend Deployment (Cloud VPS / Docker)**
- Deploy the **Node.js backend** on **AWS/DigitalOcean**.

### **FAISS & FastAPI Deployment (Docker)**
- Use **Docker Compose** to manage FAISS vector search service.

---

## 📌 **Contributing**
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`feature-xyz`).
3. Commit your changes.
4. Submit a pull request.

---

## 📜 **License**
This project is licensed under the **MIT License**.

📧 **Contact:** [rizviahmedabbas313@gmail.com](mailto:rizviahmedabbas313@gmail.com)  
🌐 **GitHub:** [Rizvi-Ahmed-Abbas-Nasir](https://github.com/Rizvi-Ahmed-Abbas-Nasir)  
💼 **LinkedIn:** [Rizvi Ahmed Abbas](https://www.linkedin.com/in/rizvi-ahmed-abbas-78b489222/)  

---

⭐ **Star this repo if you find it useful!** 🚀

