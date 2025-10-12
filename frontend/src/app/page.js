'use client';
import { useState } from "react";
import { useRouter } from 'next/navigation';
import './styles/home.css'

export default function Home() {
  const [pokemonName, setPokemonName] = useState('')
  const [pokemonImage, setPokemonImage] = useState(null)
  const [error, setError] = useState('')
  const router = useRouter();

  const handleUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const base64String = event.target.result.split(',')[1];
        setPokemonImage(base64String);
      }
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(pokemonName + " frontend");

    const response = await fetch('/api/home', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name : pokemonName, image: pokemonImage }),
    });

    if (!response.ok) {
      // Handle non-200 status codes
      console.error("Error:", response.statusText);
      setError(response.statusText);
      return;
    }
    else {
      router.push('/pokepage')
    }

  }

  return (
    <div className='page'>
      <div className='home_info'>
        <div className='page_text'>
          <h1>PokeShowdown AI</h1>
          <h4>Your Personal Pokemon Showdown Helper</h4>
        </div>
        <div className='pokemon_input'>
          <div className='input_div'>
            <h5>Enter Pokemon's Name or Upload Photo of it</h5>
            <form className="pokemon_input_form" onSubmit={handleSubmit}> 
              <input type='text' placeholder='Pokemon Name' value={pokemonName} onChange={(e) => setPokemonName(e.target.value)}></input>
              <input type='file' id="files" onChange={handleUpload} className="hidden"></input>
              <label htmlFor="files" className="upload_label">Add Image Here</label>
              <button type='submit'>Submit</button>
            </form>
            {error != '' && <h5 className="error">{error}</h5>}
          </div>
        </div>
      </div>
    </div>
  );
}
