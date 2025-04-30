# use_model.py
# Predicts helpfulness using saved models and scaled extra features.

import joblib
import torch
import re
import numpy as np
from transformers import BertTokenizer, BertModel
from nltk.corpus import stopwords
import nltk

nltk.download('stopwords')

# --- Setup ---
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- Load Models ---
save_dir = "saved_models"
rf = joblib.load(f"{save_dir}/RandomForest_Proba_Model.pkl")
lgbm_model = joblib.load(f"{save_dir}/LightGBM_model.pkl")
scaler = joblib.load(f"{save_dir}/feature_scaler.pkl")

# --- Load BERT ---
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
bert_model = BertModel.from_pretrained("bert-base-uncased").to(device)
bert_model.eval()

stop_words = set(stopwords.words("english"))

# --- Helpers ---
def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    tokens = text.split()
    tokens = [word for word in tokens if word not in stop_words]
    return " ".join(tokens)

def get_bert_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding="max_length", max_length=128)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        outputs = bert_model(**inputs)
    return outputs.last_hidden_state[:, 0, :].cpu().numpy()

def predict_helpfulness(summary, text, score, numerator, denominator):
    combined = f"{summary}. {text}"
    cleaned = clean_text(combined)
    embedding = get_bert_embedding(cleaned)

    # Random Forest probability
    prob = rf.predict_proba(embedding)[:, 1]

    # Extra features
    extras = np.array([[score, numerator, denominator]])
    extras_scaled = scaler.transform(extras)

    # Final input
    final_input = np.hstack((embedding, prob.reshape(-1, 1), extras_scaled))

    prediction = lgbm_model.predict(final_input)[0]
    confidence = lgbm_model.predict_proba(final_input)[0][prediction]

    return {
        "prediction": "Helpful ✅" if prediction == 1 else "Not Helpful ❌",
        "confidence": f"{confidence * 100:.2f}%"
    }

# --- Example Usage ---
if __name__ == "__main__":
    review = {
        "summary": "Great taffy",
        "text": "Great!  Just as good as the expensive brands!",
        "score": 5,
        "numerator": 0,
        "denominator": 0
    }

    result = predict_helpfulness(**review)
    print(result)
