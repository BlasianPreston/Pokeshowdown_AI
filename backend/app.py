from flask import Flask, request, jsonify
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from google import genai
import requests
import base64
import os

load_dotenv()

# Create Flask app
app = Flask(__name__)
CORS(app, origins=['*'], supports_credentials=True) # Allows Flask to communicate with NextJS even though they are on different ports

# Configure Gemini AI
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-1.5-flash')

def analyze_pokemon_image(image_data):
    """Analyze meal image using Gemini AI to estimate calories"""
    try:
        # Convert image to base64 for Gemini
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        prompt = f"""
        You are a Pokemon master trying to decipher what Pokemon is in the image. Please analyze this image and provide classify the main Pokemon in the image.
        
        Instructions:
        1. Identify the most prominent Pokemon in the image
        
        Please respond in this exact JSON format:
        {{
            "pokemon": "The name of the pokemon and only the name or 'N/A' if you cannot find a pokemon",
        }}
        
        
        Remember: Be accurate and realistic with your guess of which Pokemon is the main one in the image.
        """
        
        # Generate content using Gemini
        response = model.generate_content([
            prompt,
            {
                "mime_type": "image/jpeg",
                "data": image_base64
            }
        ])
        
        # Parse the actual response from Gemini
        response_text = response.text.strip()
        print(f"Gemini response: {response_text}")
        
        # Check if we got a valid response
        if not response_text:
            print("Warning: Empty response from Gemini")
            return {
                "pokemon": "N/A",
            }
        
        # Try to extract information from the response
        try:
            # Look for JSON in the response
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                import json
                parsed_response = json.loads(json_match.group())
                return {
                    "pokemon" : parsed_response.get("pokemon", "N/A")
                }
        except Exception as parse_error:
            print(f"Error parsing JSON response: {parse_error}")
        
        print("Pokemon couldn't be extracted from Gemini response")
        return {
            "pokemon": "N/A",
        }
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return {
            "pokemon": "N/A"
        }


@app.route('/', methods=['POST'])
def query_pokemon():
    data = request.get_json()
    pokemon_name = data.get('name')
    pokemon_image = data.get('image')

    if pokemon_image:
        return analyze_pokemon_image(pokemon_image)
    
    if pokemon_name:
        return jsonify({
            'pokemon': pokemon_name
        })
    
    return jsonify({'pokemon': 'N/A'}), 401