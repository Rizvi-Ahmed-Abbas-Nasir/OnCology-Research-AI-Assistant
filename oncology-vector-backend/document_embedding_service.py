from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from pymongo import MongoClient
from bson.objectid import ObjectId
import faiss
import numpy as np
import requests
import os
import fitz  
from fastapi.responses import FileResponse
from TTS.api import TTS

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

@app.post("/upload-abstract")
async def upload_abstract(payload: AbstractPayload):
    """Store oncology abstract and its embedding in MongoDB and FAISS."""
    global vector_store

    text_data = f"{payload.title}\n\n{payload.abstract}"
    embedding = generate_embedding(text_data).reshape(1, -1)

    new_document = {"title": payload.title, "abstract": payload.abstract}
    result = collection.insert_one(new_document)
    document_id = str(result.inserted_id)

    if vector_store is None:
        vector_store = faiss.IndexFlatL2(dimension)  

    vector_store.add(embedding)  

    faiss_index = vector_store.ntotal - 1 
    mapping_collection.insert_one({"faiss_index": faiss_index, "document_id": document_id})

    faiss.write_index(vector_store, index_file_path)

    return {"message": "Abstract added successfully", "document_id": document_id}

def extract_text_from_pdf(pdf_file):
    """Extracts text from a PDF file object."""
    try:
        pdf_bytes = pdf_file.read()  
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")  
        text = "\n".join([page.get_text("text") for page in doc])  
        doc.close()
        return text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting text from PDF: {str(e)}")

@app.post("/upload-paper")
async def upload_paper(file: UploadFile = File(...)):
    """Extracts text from PDF, generates embedding, and stores it."""
    global vector_store

    pdf_text = extract_text_from_pdf(file.file)

    if not pdf_text.strip():
        raise HTTPException(status_code=400, detail="No text found in the uploaded PDF.")

    embedding = generate_embedding(pdf_text).reshape(1, -1)

    new_document = {"title": file.filename, "abstract": pdf_text}
    result = collection.insert_one(new_document)
    document_id = str(result.inserted_id)

    if vector_store is None:
        vector_store = faiss.IndexFlatL2(dimension)  

    vector_store.add(embedding)

    faiss_index = vector_store.ntotal - 1
    mapping_collection.insert_one({"faiss_index": faiss_index, "document_id": document_id})

    faiss.write_index(vector_store, index_file_path)

    return {"message": "PDF uploaded and processed successfully", "document_id": document_id}


class QueryPayload(BaseModel):
    query: str
    top_k: int = 5


def is_oncology_related(text: str) -> bool:
    """Checks if the given text is related to oncology."""
    allowed_keywords = {
        "cancer", "oncology", "tumor", "chemotherapy", "radiotherapy",
        "immunotherapy", "metastasis", "biopsy", "carcinoma", "sarcoma"
    }
    return any(keyword in text.lower() for keyword in allowed_keywords)
from fastapi.responses import JSONResponse

@app.post("/query")
async def query_vectorstore(payload: QueryPayload):
    try:
        if not is_oncology_related(payload.query):
            return JSONResponse(
                content={"message": "I'm designed to answer only oncology-related questions. Please ask something relevant."},
                status_code=400
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
                continue  # Ignore invalid indices

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

        results = sorted(results, key=lambda x: x["similarity_score"])  # Sort by similarity
        return JSONResponse(content={"documents": results}, status_code=200)

    except Exception as e:
        return JSONResponse(
            content={"error": "Internal Server Error", "details": str(e)},
            status_code=500
        )



# Load the best natural-sounding TTS model
tts = TTS("tts_models/en/ljspeech/tacotron2-DDC").to("cpu")

@app.post("/synthesize")
async def synthesize_text(text: str):
    output_path = "output.wav"
    tts.tts_to_file(text=text, file_path=output_path)
    return FileResponse(output_path, media_type="audio/wav")
