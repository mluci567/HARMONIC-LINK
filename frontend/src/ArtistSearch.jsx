// frontend/src/ArtistSearch.jsx
import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export default function ArtistSearch({ onArtistSelect, placeholder }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 2) {
      const { data } = await axios.get(`${API_URL}/search?artist=${value}`);
      setResults(data);
    } else {
      setResults([]);
    }
  };

  const handleSelect = (artist) => {
    onArtistSelect(artist);
    setQuery(artist.name);
    setResults([]);
  };

  return (
    <div className="search-container">
      {/* The styling is applied via .artist-search input in App.css */}
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder={placeholder}
      />
      {results.length > 0 && (
        <ul className="artist-list">
          {results.map((artist) => (
            <li key={artist.id} onClick={() => handleSelect(artist)}>
              <img src={artist.imageUrl} alt={artist.name} width="40" />
              {artist.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}