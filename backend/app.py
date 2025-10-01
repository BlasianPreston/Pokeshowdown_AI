from flask import Flask, request, jsonify
from bs4 import BeautifulSoup
from google import genai
import requests

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
CORS(app, origins=['*'], supports_credentials=True) # Allows Flask to communicate with NextJS even though they are on different ports

# Configure Gemini AI
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-1.5-flash')

@app.route('/')
def home():
    return jsonify({'message': 'Calorie Tracking API is running'})