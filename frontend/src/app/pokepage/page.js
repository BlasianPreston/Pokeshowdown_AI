'use client'
import { useEffect, useState } from "react";
import StatBars from '../components/StatBars.js';
import Movesets from '../components/MoveSets.js';
import '../styles/pokepage.css'

function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export default function Pokepage() {
    const [pokemonName, setPokemonName] = useState('');
    const [pokemon, setPokemon] = useState(null);
    const [types, setTypes] = useState([]);
    const [stats, setStats] = useState([]);
    const [abilities, setAbilities] = useState([])
    const [moveSets, setMoveSets] = useState([]);
    const [moveData, setMoveData] = useState([]);
    const [error, SetError] = useState('');

    async function fetchPokemon() {
        const response = await fetch('/api/pokepage', {
            method: 'GET',
        });
        const data = await response.json();
        setPokemonName(data.pokemon);
        setMoveSets(data.movesets)
        if (response.ok) {
            const base_url = "https://pokeapi.co/api/v2/pokemon/"
            const url = base_url + data.pokemon.toLowerCase() + "/"
            fetch(url)
                .then(res => res.json())
                .then(async data => {
                    setPokemon(data);
                    setAbilities(data.abilities);

                    const formattedStats = {
                        hp: data.stats.find(s => s.stat.name === "hp").base_stat,
                        attack: data.stats.find(s => s.stat.name === "attack").base_stat,
                        defense: data.stats.find(s => s.stat.name === "defense").base_stat,
                        spAtk: data.stats.find(s => s.stat.name === "special-attack").base_stat,
                        spDef: data.stats.find(s => s.stat.name === "special-defense").base_stat,
                        speed: data.stats.find(s => s.stat.name === "speed").base_stat,
                    };

                    setStats(formattedStats);

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
                    console.log(stats)
                });
        }
        else {
            SetError(data.statusText);
        }


    }

    useEffect(() => {
        fetchPokemon();
    }, []);



    if (error) {
        return <div className="page"><p className="error">Pokemon not stored in session, please re-enter information on previous page</p></div>
    }
    if (!pokemon || types.length === 0) {
        return <div className="page"><p className="loading">Loading...</p></div>
    }

    return (
        <div className="page">
            <div className="pokepage">
                <h1>{capitalizeFirstLetter(pokemon.name)}</h1>
                <div className="image-stats">
                    <img src={pokemon.sprites.front_default} alt={capitalizeFirstLetter(pokemon.name)}></img>
                    <StatBars stats={stats} />
                </div>
                <div>
                    <h2>Types:</h2>
                    <div className="types">
                        {types.map((type, index) => (
                            <img key={index} src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet/${type.id}.png`} alt={`type-${type.name}`} />
                        ))}
                    </div>
                </div>
                <div>
                    <h2>Abilities:</h2>
                    <ul className="abilities">
                        {abilities.map((ability, index) => (
                            <li key={index} className={ability.is_hidden ? "hidden-ability" : null}>{capitalizeFirstLetter(ability.ability.name)}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h5 className="possible-moves">Possible Moves:</h5>
                    <div className="table-header">
                        <h5>Name</h5>
                        <h5>Type</h5>
                        <h5>Power</h5>
                        <h5>Accuracy</h5>
                        <h5>Level Learned</h5>
                    </div>
                    <ul>
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
                <div>
                    <Movesets data={moveSets}/>
                </div>
            </div>
        </div>
    )
}