# Install required packages (only if needed)
# !pip install transformers scikit-learn lightgbm imbalanced-learn tqdm torch torchvision torchaudio --upgrade

import pandas as pd
import numpy as np
import re
import torch
import time
from tqdm import tqdm
from transformers import BertTokenizer, BertModel
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from lightgbm import LGBMClassifier
from imblearn.over_sampling import SMOTE
import nltk

# Download NLTK stopwords
nltk.download('stopwords')
from nltk.corpus import stopwords

# Set device for Torch
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")

# ------------------- 1. Load Partial Data -------------------
print("\nLoading dataset...")
df = pd.read_csv('Reviews.csv', nrows=5000)  # <<< Load only 15000 reviews initially
print(f"✅ Dataset loaded with {len(df)} rows.")

# ------------------- 2. Create Helpfulness Label -------------------
def generate_label(row):
    if row['HelpfulnessDenominator'] == 0:
        return 0
    return 1 if (row['HelpfulnessNumerator'] / row['HelpfulnessDenominator']) >= 0.5 else 0

df['helpful_label'] = df.apply(generate_label, axis=1)
print("✅ Helpfulness labels generated.")

# ------------------- 3. Preprocessing -------------------
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
df['clean_text'] = df['Text'].apply(clean_text)
print("✅ Text cleaning completed.")

# ------------------- 4. BERT Embedding with Batching -------------------
print("\nLoading BERT model...")
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
bert_model = BertModel.from_pretrained('bert-base-uncased').to(device)
bert_model.eval()
print("✅ BERT model ready.")

batch_size = 64  # You can adjust based on your VRAM

def get_bert_embeddings_batch(texts):
    inputs = tokenizer(texts, return_tensors="pt", truncation=True, padding='max_length', max_length=128)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        outputs = bert_model(**inputs)
    return outputs.last_hidden_state[:, 0, :].cpu().numpy()

print("\nStarting BERT embedding...")
bert_embeddings = []

for i in tqdm(range(0, len(df), batch_size), desc="Encoding Batches", ncols=100):
    batch_texts = df['clean_text'].iloc[i:i+batch_size].tolist()
    batch_embeddings = get_bert_embeddings_batch(batch_texts)
    bert_embeddings.append(batch_embeddings)

bert_embeddings = np.vstack(bert_embeddings)
print("✅ Finished BERT embedding.")

# ------------------- 5. Random Forest Class Probability Features -------------------
print("\nTraining Random Forest Classifier on BERT embeddings...")
start_time = time.time()

rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
rf.fit(bert_embeddings, df['helpful_label'])

end_time = time.time()
print(f"✅ Random Forest Training Completed in {end_time - start_time:.2f} seconds.")

probs = rf.predict_proba(bert_embeddings)
prob_helpful = probs[:, 1]

# ------------------- 6. Combine Features -------------------
print("\nCombining features...")
final_features = np.hstack((bert_embeddings, prob_helpful.reshape(-1, 1)))
y = df['helpful_label']

# ------------------- 7. Balance Dataset using SMOTE -------------------
print("\nApplying SMOTE for balancing classes...")
smote = SMOTE(random_state=42)
X_balanced, y_balanced = smote.fit_resample(final_features, y)
print(f"✅ After SMOTE: {X_balanced.shape[0]} samples.")

# ------------------- 8. Train/Test Split -------------------
print("\nSplitting dataset into Train and Test sets...")
X_train, X_test, y_train, y_test = train_test_split(X_balanced, y_balanced, test_size=0.2, random_state=42)
print(f"✅ Train Size: {X_train.shape[0]} | Test Size: {X_test.shape[0]}")

# ------------------- 9. Train Models -------------------
print("\nTraining Machine Learning models...")

models = {
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
    "KNN": KNeighborsClassifier(),
    "Decision Tree": DecisionTreeClassifier(random_state=42),
    "LightGBM": LGBMClassifier(random_state=42)
}

for name, model in models.items():
    print(f"\n🚀 Training {name}...")
    start_time = time.time()

    model.fit(X_train, y_train)

    end_time = time.time()
    print(f"✅ {name} training completed in {end_time - start_time:.2f} seconds.")

    preds = model.predict(X_test)
    print(f"=== {name} ===")
    print(classification_report(y_test, preds))
    print("Confusion Matrix:\n", confusion_matrix(y_test, preds))

# ------------------- 10. Cross-Validation Score -------------------
print("\n=== Cross Validation Scores ===")
for name, model in models.items():
    print(f"\nValidating {name} with 5-Fold CV...")
    start_time = time.time()

    scores = cross_val_score(model, X_balanced, y_balanced, cv=5, n_jobs=-1)

    end_time = time.time()
    print(f"{name}: Mean CV Accuracy = {scores.mean():.4f} | Time Taken: {end_time - start_time:.2f} seconds")
