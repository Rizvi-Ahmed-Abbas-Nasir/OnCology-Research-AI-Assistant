import faiss
import numpy as np
import requests
from fastapi import FastAPI

app = FastAPI() 

d = 3072  

index = faiss.IndexFlatL2(d)

OLLAMA_EMBEDDING_URL = "http://localhost:11434/api/embeddings"

def get_embedding(text):
    """Get embedding for a given text from Ollama."""
    response = requests.post(OLLAMA_EMBEDDING_URL, json={"model": "llama3.2", "prompt": text})
    return np.array(response.json()["embedding"], dtype=np.float32)

documents = [
    # AI in Oncology
    "Title: AI and Machine Learning in Oncology: A Revolution in Cancer Treatment\n"
    "Abstract: Artificial Intelligence (AI) and machine learning are transforming oncology by improving early detection, personalized treatment, and drug discovery. AI models analyze medical imaging, pathology slides, and genomic data to assist oncologists in diagnosing cancer more accurately. Machine learning algorithms identify patterns in patient data, leading to tailored treatment plans. Recent advancements include AI-assisted robotic surgery, deep learning for histopathological analysis, and natural language processing for electronic health records (EHRs). This paper discusses the latest breakthroughs, challenges, and ethical considerations in integrating AI into oncology.",

    # AI-powered Oncology Research
    "Title: Deep Learning for Cancer Diagnosis and Prognosis\n"
    "Abstract: The application of deep learning in oncology has led to significant improvements in cancer diagnosis and prognosis prediction. Convolutional Neural Networks (CNNs) and Transformer models analyze medical images, including MRI, CT scans, and histopathological slides, to detect cancer at early stages. AI models trained on extensive datasets can differentiate between benign and malignant tumors with accuracy exceeding that of traditional methods. This research presents a comparative analysis of various deep learning architectures used in cancer detection and their real-world clinical applications.",

    # Immunotherapy and AI
    "Title: AI-Driven Biomarker Discovery for Personalized Cancer Immunotherapy\n"
    "Abstract: Immunotherapy has emerged as a groundbreaking treatment modality in oncology, but patient response varies significantly. AI and bioinformatics play a crucial role in identifying predictive biomarkers for immunotherapy response. By analyzing genomic, transcriptomic, and proteomic data, machine learning models can predict which patients will benefit from immune checkpoint inhibitors. This study explores AI-powered approaches for biomarker discovery, patient stratification, and immune response prediction in various cancers, including melanoma, lung cancer, and breast cancer.",

    # Oncology Drug Development
    "Title: Machine Learning in Oncology Drug Discovery: Accelerating Development\n"
    "Abstract: The integration of AI in drug discovery has significantly accelerated the development of oncology therapeutics. Traditional drug discovery processes are time-consuming and costly, but AI-driven models can rapidly screen millions of compounds, predict drug-target interactions, and optimize clinical trial design. This paper examines how AI is revolutionizing precision oncology by identifying novel drug candidates, optimizing chemotherapy regimens, and repurposing existing drugs for cancer treatment.",

    # Radiology and AI
    "Title: AI-Assisted Radiomics: Enhancing Precision in Oncology Imaging\n"
    "Abstract: Radiomics, the extraction of high-dimensional imaging features from radiological scans, has been enhanced by AI techniques. AI-powered radiomics aids in tumor characterization, treatment response assessment, and prognosis prediction. Advanced machine learning models analyze radiomic features from CT, PET, and MRI scans to predict tumor heterogeneity and patient survival rates. This research paper reviews the latest AI applications in radiomics and their clinical implications in oncology."
]


embeddings = np.array([get_embedding(doc) for doc in documents])

index.add(embeddings)

faiss.write_index(index, "index.faiss")
print(" FAISS index created successfully and saved as 'index.faiss'.")
