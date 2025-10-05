// backend/spotifyAPI.js
require('dotenv').config();
const axios = require('axios');

let spotifyClientPromise;

const initializeSpotifyClient = async () => {
    const authString = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
    try {
        const { data } = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const accessToken = data.access_token;
        console.log('New Spotify API token obtained.');

        return axios.create({
            baseURL: 'https://api.spotify.com/v1',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
    } catch (error) {
        console.error('Error fetching Spotify token:', error.response ? error.response.data : error.message);
        throw error; 
    }
};

const getClient = () => {
    if (!spotifyClientPromise) {
        spotifyClientPromise = initializeSpotifyClient();
    }
    return spotifyClientPromise;
};

// Refresh the token every 59 minutes
setInterval(() => {
    console.log("Refreshing Spotify token...");
    spotifyClientPromise = initializeSpotifyClient();
}, 3540 * 1000);

const searchArtists = async (artistName) => {
    const spotifyClient = await getClient();
    const { data } = await spotifyClient.get(`/search?q=${encodeURIComponent(artistName)}&type=artist&limit=5`);
    return data.artists.items.map(artist => ({
        id: artist.id,
        name: artist.name,
        imageUrl: artist.images[2]?.url || ''
    }));
};

const getArtist = async (artistName) => {
    const spotifyClient = await getClient();
    const { data } = await spotifyClient.get(`/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`);
    return data.artists.items[0];
};

const getArtistTopTracks = async (artistName) => {
    const spotifyClient = await getClient();
    const artist = await getArtist(artistName);
    if (!artist) {
        return [];
    }
    const { data } = await spotifyClient.get(`/artists/${artist.id}/top-tracks?market=US`);
    return data.tracks;
};

module.exports = { searchArtists, getArtist, getArtistTopTracks };