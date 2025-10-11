from flask import Flask, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from google import genai
from google.genai import types
import requests
import base64
import os

load_dotenv()

# Create Flask app
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')
CORS(app, origins=['*'], supports_credentials=True) # Allows Flask to communicate with NextJS even though they are on different ports

# Configure Gemini AI
client = genai.Client(api_key="YOUR_GEMINI_API_KEY")


def analyze_pokemon_image(image_data):
    """Analyze Pokemon image using Gemini to identify the main Pokémon"""
    try:
        prompt = """
        You are a Pokémon master analyzing an image.
        Identify the most prominent Pokémon visible in the image.

        Respond **only** in this JSON format:
        {
            "pokemon": "The name of the Pokémon, or 'N/A' if you cannot identify one"
        }
        """

        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part(text=prompt),
                    types.Part(
                        inline_data=types.Blob(
                            mime_type="image/jpeg",
                            data=image_data
                        )
                    ),
                ],
            )
        ]

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
        )

        response_text = response.text.strip()
        print(f"Gemini response: {response_text}")

        # Handle empty response
        if not response_text:
            return {"pokemon": "N/A"}

        # ✅ Parse out JSON
        json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if json_match:
            parsed_response = json.loads(json_match.group())
            return {"pokemon": parsed_response.get("pokemon", "N/A")}

        print("Pokemon not found in Gemini response.")
        return {"pokemon": "N/A"}

    except Exception as e:
        print(f"Error analyzing image: {e}")
        return {"pokemon": "N/A"}


@app.route('/api/home', methods=['POST'])
def store_pokemon():
    data = request.get_json()
    pokemon_name = data.get('name')
    pokemon_image = data.get('image')
    result = ''

    if pokemon_image:
        result = analyze_pokemon_image(pokemon_image)
    elif pokemon_name:
        result = pokemon_name
    
    base_url = "https://pokeapi.co/api/v2/pokemon/"
    url = f"{base_url}{pokemon_name.lower()}/"

    try:
        response = requests.get(url)
        response.raise_for_status()
        session['pokemon'] = result
        return jsonify({'message': 'Pokemon Successfully Found'}), 200
    
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data for {result}: {e}")
        return jsonify({'message': 'Pokemon Unable to be Found'}), 400

@app.route('/api/pokepage', methods=['GET'])
def get_pokemon():
    name = session['pokemon']
    if name:
        return jsonify({'message': 'Pokemon Successfully Returned', 'pokemon': name}), 200
    else:
        return jsonify({'message': 'Pokemon Not Stored in Session', 'pokemon': 'N/A'}), 401
    