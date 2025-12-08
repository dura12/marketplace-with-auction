import joblib
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Load the trained model
model_path = os.path.join(os.path.dirname(__file__), 'fraud_model_text.joblib')
model = joblib.load(model_path)

app = FastAPI()

class ProductCheckRequest(BaseModel):
    productName: str
    description: str

def check_product_for_fraud(product_name: str, description: str):
    """
    Check if a product listing is potentially fraudulent.
    """
    combined_text = f"{product_name} {description}"
    prediction = model.predict([combined_text])[0]
    probability = model.predict_proba([combined_text])[0][1]

    return {
        "is_fraud": bool(prediction),
        "fraud_probability": float(round(probability, 4)),
        "is_safe": bool(probability < 0.5)
    }

@app.post("/check-product")
async def check_product(request: ProductCheckRequest):
    try:
        result = check_product_for_fraud(request.productName, request.description)
        return {
            "isFraud": result["is_fraud"],
            "fraudProbability": result["fraud_probability"],
            "isSafe": result["is_safe"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
