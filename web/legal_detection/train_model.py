# train_model.py

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
import joblib

# Load dataset
data = pd.read_csv("fraud_dataset_text_based.csv")

# Combine productName and description for better context
data["text"] = data["productName"] + " " + data["description"]

# Features and target
X = data["text"]
y = data["is_fraud"]

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Build pipeline: TF-IDF + Naive Bayes
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(stop_words="english")),
    ("nb", MultinomialNB())
])

# Train model
pipeline.fit(X_train, y_train)

# Save model
joblib.dump(pipeline, "fraud_model_text.joblib")

print("✅ Model trained and saved as fraud_model_text.joblib")
