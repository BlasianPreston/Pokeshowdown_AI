'use client';
import { useState } from "react";
import { useRouter } from 'next/navigation';
import './styles/home.css'

export default function Home() {
  const [pokemonName, setPokemonName] = useState('')
  const [pokemonImage, setPokemonImage] = useState(null)
  const router = useRouter();

  const handleUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPokemonImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push('/pokepage')
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
              <input type='text' placeholder='Pokemon Name' onChange={(e) => setPokemonName(e.target.value)}></input>
              <input type='file' id="files" onChange={handleUpload} className="hidden"></input>
              <label htmlFor="files" className="upload_label">Add Image Here</label>
              <button type='submit'>Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
