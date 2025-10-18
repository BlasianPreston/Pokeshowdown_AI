from flask import Flask, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai
from google.genai import types
import smog_usage_stats.IndividualLookup as smogI
import requests
import base64
import re
import json
import os

load_dotenv()

# Create Flask app
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')
gemini_api_key = os.getenv('GEMINI_API_KEY')
CORS(app, origins=['*'], supports_credentials=True) # Allows Flask to communicate with NextJS even though they are on different ports

# Configure Gemini AI
client = genai.Client(api_key=gemini_api_key)


def analyze_pokemon_image(image_data, mime_type):
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

        if mime_type not in ["image/jpeg", "image/png", "image/webp"]:
            return {"pokemon": "Wrong image type"}

        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part(text=prompt),
                    types.Part(
                        inline_data=types.Blob(
                            mime_type=mime_type,
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

        # Parse out JSON
        json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if json_match:
            parsed_response = json.loads(json_match.group())
            return {"pokemon": parsed_response.get("pokemon", "N/A")}

        print("Pokemon not found in Gemini response.")
        return {"pokemon": "N/A"}

    except Exception as e:
        print(f"Error analyzing image: {e}")
        return {"pokemon": "N/A"}

def get_movesets(pokemon_name):
    # Redo but with https://github.com/pkmn/smogon/blob/main/data/sets/gen9.json API


@app.route('/')
def home():
    return jsonify({'message': 'Backend is Running'}), 200


@app.route('/api/home', methods=['POST'])
def store_pokemon():
    data = request.get_json()
    pokemon_name = data.get('name')
    pokemon_image = data.get('image')
    pokemon_image_type = data.get('mime_type')
    result = ''
    

    if pokemon_image:
        # Convert image from base64 to bytes
        image_data = base64.b64decode(pokemon_image)
        analysis_result = analyze_pokemon_image(image_data, pokemon_image_type)
        result = analysis_result["pokemon"]
    elif pokemon_name:
        result = pokemon_name
    
    base_url = "https://pokeapi.co/api/v2/pokemon/"
    url = f"{base_url}{result.lower().strip()}/"

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
        return jsonify({'message': 'Pokemon Successfully Returned', 'pokemon': name, 'movesets': get_movesets(name)}), 200
    else:
        return jsonify({'message': 'Pokemon Not Stored in Session', 'pokemon': 'N/A', 'movesets': []}), 401

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)