# train_models.py

# Install required packages if needed:
# !pip install transformers scikit-learn lightgbm imbalanced-learn tqdm torch torchvision torchaudio joblib

import pandas as pd
import numpy as np
import re
import os
import time
import warnings
import joblib
import torch
from tqdm import tqdm
import nltk
from transformers import BertTokenizer, BertModel
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from lightgbm import LGBMClassifier
from imblearn.over_sampling import SMOTE
from collections import Counter
from sklearn.preprocessing import StandardScaler

# ----------------- Suppress Warnings -------------------
warnings.filterwarnings("ignore")

# Download NLTK stopwords
nltk.download('stopwords')
from nltk.corpus import stopwords

# Set device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")

# Load Data
print("\nLoading dataset...")
df = pd.read_csv('Reviews.csv', nrows=100000)
print(f"✅ Dataset loaded: {len(df)} rows.")

# Label Creation
def generate_label(row):
    if row['HelpfulnessDenominator'] == 0:
        return 0
    return 1 if (row['HelpfulnessNumerator'] / row['HelpfulnessDenominator']) >= 0.5 else 0

df['helpful_label'] = df.apply(generate_label, axis=1)

# Clean + Combine Text
stop_words = set(stopwords.words('english'))

def clean_text(text):
    if pd.isnull(text):
        return ""
    text = text.lower()
    text = re.sub(r'[^a-z\s]', '', text)
    tokens = text.split()
    tokens = [word for word in tokens if word not in stop_words]
    return ' '.join(tokens)

print("\nCleaning review texts...")
df['combined_text'] = df['Summary'].fillna('') + ". " + df['Text'].fillna('')
df['clean_text'] = df['combined_text'].apply(clean_text)

# Load BERT
print("\nLoading BERT model...")
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
bert_model = BertModel.from_pretrained('bert-base-uncased').to(device)
bert_model.eval()

batch_size = 64

def get_bert_embeddings_batch(texts):
    inputs = tokenizer(texts, return_tensors="pt", truncation=True, padding="max_length", max_length=128)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        outputs = bert_model(**inputs)
    return outputs.last_hidden_state[:, 0, :].cpu().numpy()

print("\nStarting BERT embedding...")
bert_embeddings = []
for i in tqdm(range(0, len(df), batch_size), desc="Encoding Batches", dynamic_ncols=True, leave=True, ascii=True):
    batch_texts = df['clean_text'].iloc[i:i+batch_size].tolist()
    batch_embeddings = get_bert_embeddings_batch(batch_texts)
    bert_embeddings.append(batch_embeddings)

bert_embeddings = np.vstack(bert_embeddings)
print("\n✅ Finished BERT embedding.")

# Random Forest for class probability
print("\nTraining Random Forest Classifier...")
rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
rf.fit(bert_embeddings, df['helpful_label'])

save_dir = "saved_models"
os.makedirs(save_dir, exist_ok=True)
joblib.dump(rf, os.path.join(save_dir, "RandomForest_Proba_Model.pkl"))
print(f"✅ Random Forest model saved.")

# Final Feature Set
probs = rf.predict_proba(bert_embeddings)[:, 1]
additional_features = df[['Score', 'HelpfulnessNumerator', 'HelpfulnessDenominator']].fillna(0).values

# Normalize additional features
scaler = StandardScaler()
additional_features_scaled = scaler.fit_transform(additional_features)

# Save scaler for inference
joblib.dump(scaler, os.path.join(save_dir, "feature_scaler.pkl"))

final_features = np.hstack((bert_embeddings, probs.reshape(-1, 1), additional_features_scaled))
y = df['helpful_label']

# Balance dataset
print("\nApplying SMOTE...")
smote = SMOTE(random_state=42)
X_balanced, y_balanced = smote.fit_resample(final_features, y)
print("Label distribution after SMOTE:", Counter(y_balanced))

# Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(X_balanced, y_balanced, test_size=0.2, random_state=42)

# Train and Save Models
models = {
    "Random_Forest": RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
    "KNN": KNeighborsClassifier(),
    "Decision_Tree": DecisionTreeClassifier(random_state=42),
    "LightGBM": LGBMClassifier(random_state=42, verbose=-1)
}

print("\nTraining and saving models...")
for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    print(f"\n=== {name} ===")
    print(classification_report(y_test, preds))
    print(confusion_matrix(y_test, preds))
    model_path = os.path.join(save_dir, f"{name}_model.pkl")
    joblib.dump(model, model_path)
    print(f"✅ {name} saved at {model_path}")

print("\n=== Cross-Validation Scores ===")
for name, model in models.items():
    scores = cross_val_score(model, X_balanced, y_balanced, cv=5, n_jobs=-1)
    print(f"{name}: Mean CV Accuracy = {scores.mean():.4f}")
