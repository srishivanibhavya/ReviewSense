# 🧠 ReviewSense

An AI-powered system that predicts whether a product review is helpful or not — combining powerful BERT-based text embeddings with metadata like review score, helpfulness votes, and more.

---

## 🚀 Features

- ✅ **Helpfulness prediction** (Helpful ✅ / Not Helpful ❌)
- 📊 **Confidence score** returned for every prediction
- 🧠 Uses **BERT** for text understanding
- 📦 Leverages **LightGBM** & **Random Forest** for classification
- ⚙️ Built with **Flask API**, **PyTorch**, **scikit-learn**, and **LightGBM**
- 🧪 Ready for frontend integration with **Next.js** / Postman / any HTTP client

---

## 📦 Tech Stack

| Type              | Tools Used                                         |
|-------------------|----------------------------------------------------|
| Language          | Python 3.10+                                       |
| ML Models         | LightGBM, RandomForest, BERT                      |
| Preprocessing     | NLTK, Regular Expressions                         |
| Framework         | Flask (for REST API)                              |
| Transformers      | HuggingFace `transformers`                        |
| Data Handling     | Pandas, NumPy                                     |
| Balancing         | SMOTE (imbalanced-learn)                         |
| UI Ready          | Designed to pair with **shadcn/ui** in Next.js    |

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ReviewSense.git
cd ReviewSense
```

### 2. Install Requirements
```bash
pip install -r requirements.txt
```

> Make sure your system has CUDA if you want to use GPU acceleration for BERT.

### 3. Train the Models
```bash
python train_models.py
```

This will:
- Preprocess and clean the dataset
- Generate BERT embeddings
- Train and save models
- Apply SMOTE to balance the dataset

### 4. Start the API Server
```bash
python app.py
```

Visit: [http://localhost:5000](http://localhost:5000)

---

## 🔍 API Usage

### POST `/predict`
**Request JSON:**
```json
{
  "summary": "Great taffy",
  "text": "Delicious and fresh. Delivery was fast!",
  "score": 5,
  "numerator": 3,
  "denominator": 4
}
```

**Response:**
```json
{
  "prediction": "Helpful ✅",
  "confidence": "92.18%"
}
```

---

## 🧪 Try It with Postman or cURL
```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Amazing product",
    "text": "I've been using it for weeks and it never fails.",
    "score": 5,
    "numerator": 7,
    "denominator": 8
  }'
```

---

## 📁 Directory Structure
```
ReviewSense/
├── app.py               # Flask API
├── train_models.py      # Model training pipeline
├── use_model.py         # Test script for predictions
├── saved_models/        # Saved models (LightGBM, RF, Scaler)
├── Reviews.csv          # Dataset
└── README.md            # Project documentation
```

---

## 💡 Future Plans
- [ ] Add sarcasm detection
- [ ] Fine-tune BERT for domain-specific reviews
- [ ] Frontend UI with shadcn/ui + Next.js
- [ ] Dockerize the full pipeline

---

## 🤝 Contributing
Pull requests and issues are welcome! Let’s make review quality detection smarter together.

---

## 📜 License
This project is licensed under the MIT License.

---

> Made with 💡 and 🤖 by [srishivanibhavya](https://github.com/srishivanibhavya)
