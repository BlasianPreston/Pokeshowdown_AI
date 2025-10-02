import React from 'react';
import './styles/home.css'

export default function Home() {
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
            <form> 
              <input type='text' placeholder='Pokemon Name'></input>
              <input type='file'></input>
              <button type='submit'>Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
