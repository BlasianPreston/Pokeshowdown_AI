'use client'
import { useEffect, useState } from "react";
import '../styles/pokepage.css'

function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export default function Pokepage() {
    const [pokemon, setPokemon] = useState(null);
    const [types, setTypes] = useState([]);
    const [stats, setStats] = useState([]);
    const [abilities, setAbilities] = useState([])
    const [moves, setMoves] = useState([]);
    const [moveData, setMoveData] = useState([]);

    async function fetchPokemon() {
        fetch("https://pokeapi.co/api/v2/pokemon/greninja")
            .then(res => res.json())
            .then(async data => {
                setPokemon(data);
                setStats(data.stats);
                setAbilities(data.abilities);
                setMoves(data.moves);

                for (const t of data.types) {
                    const res = await fetch(t.type.url);
                    const typeData = await res.json();
                    setTypes(prev => [...prev, typeData]);
                }

                const movePromises = data.moves.map(async (entry) => {
                    const moveUrl = entry.move.url;
                    const res = await fetch(moveUrl);
                    const moveDetails = await res.json();

                    // Extract type id safely
                    const typeUrl = moveDetails.type.url;
                    const typeId = typeUrl.split("/").filter(Boolean).pop();

                    return {
                        name: moveDetails.name,
                        power: moveDetails.power,
                        accuracy: moveDetails.accuracy,
                        type: { name: moveDetails.type.name, id: typeId },
                        levelLearned: entry.version_group_details.at(-1)?.level_learned_at ?? "—",
                    };
                });

                const detailedMoves = await Promise.all(movePromises);
                setMoveData(detailedMoves);
            });

    }

    useEffect(() => {
        fetchPokemon();
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
                <div>
                    <h2>Abilities:</h2>
                    <ul>
                        {abilities.map((ability, index) => (
                            <li key={index} className={ability.is_hidden ? "hidden-ability" : null}>{ability.ability.name}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h5>Possible Moves:</h5>
                    <ul>
                        <li>
                            <h5>Name</h5>
                            <h5>Type</h5>
                            <h5>Power</h5>
                            <h5>Accuracy</h5>
                            <h5>Level Learned</h5>
                        </li>
                        <div className="move-list-container">
                            {moveData.map((move, index) => {
                                return (
                                    <li key={index} className="move-list">
                                        <h5>{move.name}</h5>
                                        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet/${move.type.id}.png`} />
                                        <h5>{move.power}</h5>
                                        <h5>{move.accuracy}</h5>
                                        <h5>{move.levelLearned}</h5>
                                    </li>
                                )
                            })}
                        </div>
                    </ul>
                </div>
            </div>
        </div>
    )
}