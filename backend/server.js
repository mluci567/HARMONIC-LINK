// backend/server.js
const express = require('express');
const cors = require('cors');
const { searchArtists, getArtist } = require('./spotifyAPI');
const { findArtistPath, generatePlaylist } = require('./pathfinder');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Endpoint for searching artists
app.get('/api/search', async (req, res) => {
    const artistName = req.query.artist;
    if (!artistName) {
        return res.status(400).json({ error: 'Artist query is required' });
    }
    try {
        const artists = await searchArtists(artistName);
        res.json(artists);
    } catch (error) {
        console.error('Search error:', error.message);
        res.status(500).json({ error: 'Failed to search for artists' });
    }
});

// Endpoint for finding the path
app.post('/api/path', async (req, res) => {
    const { startArtistName, endArtistName } = req.body;
    if (!startArtistName || !endArtistName) {
        return res.status(400).json({ error: 'Start and end artist names are required' });
    }

    try {
        const path = await findArtistPath(startArtistName, endArtistName);

        if (path) {
            // Fetch images for all artists in the path from Spotify
            const pathWithImages = await Promise.all(path.map(async (step) => {
                const artistInfo = await getArtist(step.artist);
                return {
                    name: step.artist,
                    link: step.link_type ? `${step.link_type}: ${step.details}` : 'Starting Artist',
                    imageUrl: artistInfo && artistInfo.images[2] ? artistInfo.images[2].url : ''
                };
            }));
            res.json(pathWithImages);
        } else {
            res.status(404).json({ message: 'No path found' });
        }
    } catch (error) {
        console.error('Pathfinding error:', error);
        res.status(500).json({ error: 'An error occurred while finding the path' });
    }
});

// Endpoint for generating a playlist
app.post('/api/playlist', async (req, res) => {
    const { path } = req.body;
    if (!path || !Array.isArray(path) || path.length === 0) {
        return res.status(400).json({ error: 'A valid path is required to generate a playlist' });
    }
    try {
        const playlistTracks = await generatePlaylist(path);
        res.json({ tracks: playlistTracks });
    } catch (error) {
        console.error('Playlist generation error:', error);
        res.status(500).json({ error: 'Failed to generate playlist' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});