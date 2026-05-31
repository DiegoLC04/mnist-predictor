from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, File, UploadFile
from PIL import Image
import numpy as np
import tensorflow as tf
import io

app = FastAPI(title="API Predicción MNIST")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    modelo = tf.keras.models.load_model("model/modelo_mnist.keras")
    print("Modelo cargado correctamente")
except Exception as e:
    raise RuntimeError(f"Error cargando modelo: {e}")

@app.get("/")
def root():
    return {"message": "Modelo MNIST funcionando", "version": "1.0"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        image = Image.open(io.BytesIO(contents)).convert("RGBA")
        fondo = Image.new("RGBA", image.size, (0, 0, 0, 255))
        fondo.paste(image, mask=image.split()[3])
        image = fondo.convert("L")

        image = image.resize((28, 28), Image.LANCZOS)
        image = np.array(image, dtype=np.float32) / 255.0

        print("\n===== IMAGEN =====")
        print("Min:", image.min())
        print("Max:", image.max())
        print("Shape:", image.shape)

        image = image.reshape(1, 28, 28, 1)

        pred = modelo.predict(image, verbose=0)
        clase = int(np.argmax(pred))
        probabilidad = float(np.max(pred))
        probabilidades = {
            str(i): round(float(pred[0][i]) * 100, 2)
            for i in range(10)
        }

        print("\n======================")
        print("Predicción:", clase)
        print("Probabilidad:", round(probabilidad * 100, 2))
        print("Todas:", probabilidades)
        print("======================\n")

        return {
            "clase": clase,
            "probabilidad": round(probabilidad * 100, 2),
            "probabilidades": probabilidades
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))