from fastapi import FastAPI
from fastapi.responses import FileResponse
import os
from TTS.api import TTS

app = FastAPI()

# Load the best natural-sounding TTS model
tts = TTS("tts_models/en/ljspeech/tacotron2-DDC").to("cpu")

@app.post("/synthesize")
async def synthesize_text(text: str):
    output_path = "output.wav"
    tts.tts_to_file(text=text, file_path=output_path)
    return FileResponse(output_path, media_type="audio/wav")
