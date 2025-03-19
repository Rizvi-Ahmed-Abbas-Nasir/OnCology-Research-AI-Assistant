import faiss
import numpy as np
import requests
import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from pymongo import MongoClient
from bson.objectid import ObjectId
import fitz  
from sklearn.cluster import KMeans  
from fastapi.responses import JSONResponse

app = FastAPI()

MONGO_URI = "mongodb+srv://rizvi-ahmed-abbas-project:abbas313@cluster0.4acgnyu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["documentDB"]
collection = db["documents"]
mapping_collection = db["faiss_mappings"]

index_file_path = "./faiss_index"
vector_store = None
dimension = 3072

OLLAMA_MODEL = "llama3.2"  
OLLAMA_URL = "http://localhost:11434/api/embeddings"

class AbstractPayload(BaseModel):
    title: str
    abstract: str

class QueryPayload(BaseModel):
    query: str
    top_k: int = 5

def generate_embedding(text: str):
    """Generate embedding for a given text using Ollama Llama."""
    try:
        response = requests.post(
            OLLAMA_URL,
            json={"model": OLLAMA_MODEL, "prompt": text}
        )
        response.raise_for_status()
        embedding = response.json().get("embedding")
        
        if not embedding:
            raise ValueError("No embedding returned from Ollama.")
        
        return np.array(embedding, dtype=np.float32)
    except Exception as e:
        print(f"Error generating embedding with Ollama: {e}")
        raise HTTPException(status_code=500, detail="Error generating embedding.")

def extract_text_from_pdf(pdf_file):
    """Extract text from an uploaded PDF file."""
    text = ""
    try:
        with fitz.open(pdf_file) as doc:
            for page in doc:
                text += page.get_text()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting text from PDF: {e}")
    
    return text.strip()

@app.on_event("startup")
def load_faiss_index():
    """Load or create FAISS index on startup."""
    global vector_store
    
    if os.path.exists(index_file_path):
        print("Loading FAISS index from disk...")
        vector_store = faiss.read_index(index_file_path)
        print("FAISS index loaded successfully.")
    else:
        print("No FAISS index found. Initializing a new one...")
        vector_store = faiss.IndexFlatL2(dimension) 

@app.post("/upload-abstracts")
async def upload_abstracts(payload: list[AbstractPayload]):
    """Store multiple abstracts and their embeddings in MongoDB and FAISS."""
    global vector_store

    embeddings = []
    documents = []

    for abstract_data in payload:
        text_data = f"{abstract_data.title}\n\n{abstract_data.abstract}"
        embedding = generate_embedding(text_data)
        embeddings.append(embedding)

        new_document = {"title": abstract_data.title, "abstract": abstract_data.abstract}
        documents.append(new_document)

    if vector_store is None:
        vector_store = faiss.IndexFlatL2(dimension)

    embeddings = np.array(embeddings).reshape(len(embeddings), dimension)
    vector_store.add(embeddings)

    document_ids = []
    for doc in documents:
        result = collection.insert_one(doc)
        document_ids.append(str(result.inserted_id))

    faiss_index = vector_store.ntotal - len(embeddings)
    for i, doc_id in enumerate(document_ids):
        mapping_collection.insert_one({"faiss_index": faiss_index + i, "document_id": doc_id})

    faiss.write_index(vector_store, index_file_path)

    return {"message": "Abstracts added successfully", "document_ids": document_ids}
@app.post("/query")
async def query_vectorstore(payload: QueryPayload):
    try:
        if not is_oncology_related(payload.query):
            return JSONResponse(
                content={"message": "I'm designed to answer only oncology-related questions. Please ask something relevant."},
                status_code=200
            )

        if vector_store is None or vector_store.ntotal == 0:
            return JSONResponse(
                content={"error": "FAISS vector store is not initialized."},
                status_code=500
            )

        query_embedding = generate_embedding(payload.query).reshape(1, -1)

        distances, indices = vector_store.search(query_embedding, payload.top_k)

        results = []
        for idx, distance in zip(indices[0], distances[0]):
            if idx == -1:
                continue 

            mapping = mapping_collection.find_one({"faiss_index": int(idx)})
            if mapping:
                document = collection.find_one({"_id": ObjectId(mapping["document_id"])})

                if document and is_oncology_related(document.get("abstract", "")):
                    results.append({
                        "title": document.get("title", "Untitled"),
                        "abstract": document.get("abstract", "No abstract available"),
                        "similarity_score": float(distance)
                    })

        if len(results) < 5:
            additional_results_needed = 3 - len(results)
            all_distances, all_indices = vector_store.search(query_embedding, vector_store.ntotal)  

            for idx, distance in zip(all_indices[0], all_distances[0]):
                if len(results) >= 3:
                    break
                if idx == -1:
                    continue 

                mapping = mapping_collection.find_one({"faiss_index": int(idx)})
                if mapping:
                    document = collection.find_one({"_id": ObjectId(mapping["document_id"])})

                    if document and is_oncology_related(document.get("abstract", "")):
                        results.append({
                            "title": document.get("title", "Untitled"),
                            "abstract": document.get("abstract", "No abstract available"),
                            "similarity_score": float(distance)
                        })

        if not results:
            return JSONResponse(
                content={"message": "No relevant oncology documents found."},
                status_code=404
            )

        results = sorted(results, key=lambda x: x["similarity_score"], reverse=True)  

        return JSONResponse(content={"documents": results[:3]}, status_code=200)

    except Exception as e:
        return JSONResponse(
            content={"error": "Internal Server Error", "details": str(e)},
            status_code=500
        )



def is_oncology_related(text: str) -> bool:
    """Checks if the given text is related to oncology."""
    allowed_keywords = {
        "cancer", "oncology", "tumor", "chemotherapy", "radiotherapy",
        "immunotherapy", "metastasis", "biopsy", "carcinoma", "sarcoma"
    }
    return any(keyword in text.lower() for keyword in allowed_keywords)

def cluster_abstracts(embeddings: np.ndarray, n_clusters: int = 5):
    """Cluster the abstracts using KMeans clustering."""
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    cluster_labels = kmeans.fit_predict(embeddings)
    return cluster_labels
