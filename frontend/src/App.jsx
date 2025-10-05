// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ArtistSearch from './ArtistSearch';
import ResultsPage from './ResultsPage';
import LoadingPage from './LoadingPage';
import './App.css';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [startArtist, setStartArtist] = useState(null);
  const [endArtist, setEndArtist] = useState(null);
  const [path, setPath] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const createPlaylist = async () => {
      if (path && path.length > 0) {
        try {
          const playlistResponse = await axios.post(`${API_URL}/playlist`, { path });
          setPlaylist(playlistResponse.data.tracks);
          setShowResults(true); 
          setLoading(false);
        } catch (err) {
          console.error('Failed to generate playlist:', err);
          setError('Could not generate a playlist.');
          setLoading(false);
        }
      }
    };

    createPlaylist();
  }, [path]);

  const findPath = async () => {
    if (!startArtist || !endArtist) {
      setError('Please select both a start and an end artist.');
      return;
    }
    setLoading(true);
    setError('');
    setPath(null);
    setPlaylist([]);

    try {
      const pathResponse = await axios.post(`${API_URL}/path`, {
        startArtistName: startArtist.name,
        endArtistName: endArtist.name,
      });
      setPath(pathResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to find a path.');
      console.error(err);
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setShowResults(false);
    setPath(null);
    setPlaylist([]);
    setStartArtist(null);
    setEndArtist(null);
  };

  return (
    <div className="App">
      {showResults ? (
        <ResultsPage path={path} playlist={playlist} onGoBack={handleGoBack} />
      ) : loading ? (
        <LoadingPage />
      ) : (
        <>
          <header className="App-header">
            <pre className="ascii-title">{`
    ▄         ▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄       ▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄        ▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄       ▄            ▄▄▄▄▄▄▄▄▄▄▄  ▄▄        ▄  ▄    ▄ 
   ▐░▌       ▐░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░▌     ▐░░▌▐░░░░░░░░░░░▌▐░░▌      ▐░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌     ▐░▌          ▐░░░░░░░░░░░▌▐░░▌      ▐░▌▐░▌  ▐░▌
   ▐░▌       ▐░▌▐░█▀▀▀▀▀▀▀█░▌▐░█▀▀▀▀▀▀▀█░▌▐░▌░▌   ▐░▐░▌▐░█▀▀▀▀▀▀▀█░▌▐░▌░▌     ▐░▌ ▀▀▀▀█░█▀▀▀▀ ▐░█▀▀▀▀▀▀▀▀▀      ▐░▌           ▀▀▀▀█░█▀▀▀▀ ▐░▌░▌     ▐░▌▐░▌ ▐░▌ 
   ▐░▌       ▐░▌▐░▌       ▐░▌▐░▌       ▐░▌▐░▌▐░▌ ▐░▌▐░▌▐░▌       ▐░▌▐░▌▐░▌    ▐░▌     ▐░▌     ▐░▌               ▐░▌               ▐░▌     ▐░▌▐░▌    ▐░▌▐░▌▐░▌  
   ▐░█▄▄▄▄▄▄▄█░▌▐░█▄▄▄▄▄▄▄█░▌▐░█▄▄▄▄▄▄▄█░▌▐░▌ ▐░▐░▌ ▐░▌▐░▌       ▐░▌▐░▌ ▐░▌   ▐░▌     ▐░▌     ▐░▌               ▐░▌               ▐░▌     ▐░▌ ▐░▌   ▐░▌▐░▌░▌   
   ▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░▌  ▐░▌  ▐░▌▐░▌       ▐░▌▐░▌  ▐░▌  ▐░▌     ▐░▌     ▐░▌               ▐░▌               ▐░▌     ▐░▌  ▐░▌  ▐░▌▐░░▌    
   ▐░█▀▀▀▀▀▀▀█░▌▐░█▀▀▀▀▀▀▀█░▌▐░█▀▀▀▀█░█▀▀ ▐░▌   ▀   ▐░▌▐░▌       ▐░▌▐░▌   ▐░▌ ▐░▌     ▐░▌     ▐░▌               ▐░▌               ▐░▌     ▐░▌   ▐░▌ ▐░▌▐░▌░▌   
   ▐░▌       ▐░▌▐░▌       ▐░▌▐░▌     ▐░▌  ▐░▌       ▐░▌▐░▌       ▐░▌▐░▌    ▐░▌▐░▌     ▐░▌     ▐░▌               ▐░▌               ▐░▌     ▐░▌    ▐░▌▐░▌▐░▌▐░▌  
   ▐░▌       ▐░▌▐░▌       ▐░▌▐░▌      ▐░▌ ▐░▌       ▐░▌▐░█▄▄▄▄▄▄▄█░▌▐░▌     ▐░▐░▌ ▄▄▄▄█░█▄▄▄▄ ▐░█▄▄▄▄▄▄▄▄▄      ▐░█▄▄▄▄▄▄▄▄▄  ▄▄▄▄█░█▄▄▄▄ ▐░▌     ▐░▐░▌▐░▌ ▐░▌ 
   ▐░▌       ▐░▌▐░▌       ▐░▌▐░▌       ▐░▌▐░▌       ▐░▌▐░░░░░░░░░░░▌▐░▌      ▐░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌     ▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░▌      ▐░░▌▐░▌  ▐░▌
    ▀         ▀  ▀         ▀  ▀         ▀  ▀         ▀  ▀▀▀▀▀▀▀▀▀▀▀  ▀        ▀▀  ▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀       ▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀  ▀        ▀▀  ▀    ▀ 
            `}</pre>
            <pre className="ascii-subtitle">{`
   ▛▀▘▗      ▌ ▐  ▌         ▌        ▐        ▐         ▜▜    ▌           ▐  ▗              ▐  ▌   ▌     ▐                ▐                ▐  ▗    ▐       
   ▙▄ ▄ ▛▀▖▞▀▌ ▜▀ ▛▀▖▞▀▖ ▞▀▘▛▀▖▞▀▖▙▀▖▜▀ ▞▀▖▞▀▘▜▀  ▞▀▖▞▀▖▐▐ ▝▀▖▛▀▖▞▀▖▙▀▖▝▀▖▜▀ ▄ ▞▀▖▛▀▖ ▛▀▖▝▀▖▜▀ ▛▀▖ ▛▀▖▞▀▖▜▀ ▌  ▌▞▀▖▞▀▖▛▀▖ ▜▀ ▌  ▌▞▀▖ ▝▀▖▙▀▖▜▀ ▄ ▞▀▘▜▀ ▞▀▘  
   ▌  ▐ ▌ ▌▌ ▌ ▐ ▖▌ ▌▛▀  ▝▀▖▌ ▌▌ ▌▌  ▐ ▖▛▀ ▝▀▖▐ ▖ ▌ ▖▌ ▌▐▐ ▞▀▌▌ ▌▌ ▌▌  ▞▀▌▐ ▖▐ ▌ ▌▌ ▌ ▙▄▘▞▀▌▐ ▖▌ ▌ ▌ ▌▛▀ ▐ ▖▐▐▐ ▛▀ ▛▀ ▌ ▌ ▐ ▖▐▐▐ ▌ ▌ ▞▀▌▌  ▐ ▖▐ ▝▀▖▐ ▖▝▀▖▗▖
   ▘  ▀▘▘ ▘▝▀▘  ▀ ▘ ▘▝▀▘ ▀▀ ▘ ▘▝▀ ▘   ▀ ▝▀▘▀▀  ▀  ▝▀ ▝▀  ▘▘▝▀▘▀▀ ▝▀ ▘  ▝▀▘ ▀ ▀▘▝▀ ▘ ▘ ▌  ▝▀▘ ▀ ▘ ▘ ▀▀ ▝▀▘ ▀  ▘▘ ▝▀▘▝▀▘▘ ▘  ▀  ▘▘ ▝▀  ▝▀▘▘   ▀ ▀▘▀▀  ▀ ▀▀ ▝▘
            `}</pre>
          </header>
          <div className="controls">
            <ArtistSearch
              key={`start-${startArtist}`}
              onArtistSelect={setStartArtist}
              placeholder="Start Artist..."
            />
            <ArtistSearch
              key={`end-${endArtist}`}
              onArtistSelect={setEndArtist}
              placeholder="End Artist..."
            />
            <button onClick={findPath} disabled={loading}>
              Find Path
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </>
      )}
    </div>
  );
}

export default App;