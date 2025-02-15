import faiss
import numpy as np
import requests

d = 3072  

index = faiss.IndexFlatL2(d)

OLLAMA_EMBEDDING_URL = "http://localhost:11434/api/embeddings"

def get_embedding(text):
    """Get embedding for a given text from Ollama."""
    response = requests.post(OLLAMA_EMBEDDING_URL, json={"model": "llama3.2", "prompt": text})
    return np.array(response.json()["embedding"], dtype=np.float32)

documents = [
    "AI and machine learning are revolutionizing healthcare.",
    "Oncology research benefits from AI-powered insights.",
    "Deep learning models assist in cancer diagnosis."
]

embeddings = np.array([get_embedding(doc) for doc in documents])

index.add(embeddings)

faiss.write_index(index, "index.faiss")
print("🎯 FAISS index created successfully and saved as 'index.faiss'.")
