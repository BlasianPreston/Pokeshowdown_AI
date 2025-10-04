'use client'
import { useEffect, useState } from "react";
import '../styles/pokepage.css'

function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export default function Pokepage() {
    const [pokemon, setPokemon] = useState(null);
    const [types, setTypes] = useState([]);

    useEffect(() => {
        fetch("https://pokeapi.co/api/v2/pokemon/greninja")
            .then((res) => res.json())
            .then((data) => {
                setPokemon(data);

                const typeInfo = data.types.map((t) => {
                    const url = t.type.url
                    fetch(url)
                        .then((res) => res.json())
                        .then((typeData) => {
                            setTypes(prev => [...prev, typeData]);
                        });
                });
            });
    }, []);



    if (!pokemon || types == []) {
        return <p>Loading...</p>
    }

    return (
        <div className="page">
            <div className="pokepage">
                <h1>{capitalizeFirstLetter(pokemon.name)}</h1>
                <img src={pokemon.sprites.front_default} alt={capitalizeFirstLetter(pokemon.name)}></img>
                <div>
                    <h2>Types:</h2>
                    <ul>
                        {types.map((type, index) => (
                            <img key={index} src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet/${type.id}.png`} alt={`type-${type.name}`} />
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}