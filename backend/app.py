import os
import re
from flask import Flask, jsonify, request
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app)

# Load trained Logistic Regression model & TF-IDF vectorizer
model = joblib.load("sentiment_model.pkl")
vectorizer = joblib.load("tfidf_vectorizer.pkl")


def clean_text(text):
  text = str(text).lower()
  text = re.sub(r"<br\s*/?>", " ", text)
  text = re.sub(r"http\S+|www\S+", "", text)
  text = re.sub(r"[^a-z\s]", "", text)
  text = re.sub(r"\s+", " ", text).strip()
  return text


@app.route("/", methods=["GET"])
def health_check():
  return jsonify({"status": "Logistic Regression Sentiment API is running"})


@app.route("/predict", methods=["POST"])
def predict():
  data = request.get_json()
  review = data.get("review", "")

  if not review or not review.strip():
    return jsonify({"error": "Please enter a product review."}), 400

  cleaned = clean_text(review)
  if not cleaned:
    return jsonify({"error": "Please enter valid alphabetic words."}), 400

  vec = vectorizer.transform([cleaned])
  probs = model.predict_proba(vec)[0]  # [P(y=0|x), P(y=1|x)]
  neg_prob = float(probs[0])
  pos_prob = float(probs[1])

  # Classify into Positive, Neutral, or Negative using sigmoid probability
  if pos_prob >= 0.65:
    sentiment = "Positive"
  elif pos_prob <= 0.40:
    sentiment = "Negative"
  else:
    sentiment = "Neutral"

  return jsonify({
      "sentiment": sentiment,
      "positive_score": round(pos_prob * 100, 1),
      "negative_score": round(neg_prob * 100, 1),
  })


if __name__ == "__main__":
  port = int(os.environ.get("PORT", 5000))
  app.run(host="0.0.0.0", port=port)