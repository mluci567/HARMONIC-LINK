// backend/externalAPIs.js
const axios = require('axios');
require('dotenv').config();

const WIKIDATA_API_URL = 'https://query.wikidata.org/sparql';
const GENIUS_API_URL = 'https://api.genius.com';
const GENIUS_ACCESS_TOKEN = process.env.GENIUS_ACCESS_TOKEN;

/**
 * Fetches collaborators from Wikidata using a SPARQL query.
 * Looks for direct relationships like band members, producers, etc.
 * @param {string} artistName - The name of the artist to search for.
 * @returns {Promise<Array>} A promise that resolves to an array of collaborator objects.
 */
const getWikidataCollaborators = async (artistName) => {
    // Properties for "member of", "record label", "producer", etc.
    const properties = [
        'P527', // has part
        'P463', // member of
        'P106', // occupation
        'P264', // record label
        'P175', // performer
        'P162', // producer
    ];

    const sparqlQuery = `
    SELECT ?artist ?artistLabel ?linkTypeLabel WHERE {
      SERVICE wikibase:mwapi {
        bd:serviceParam wikibase:api "EntitySearch" .
        bd:serviceParam wikibase:endpoint "www.wikidata.org" .
        bd:serviceParam mwapi:search "${artistName}" .
        bd:serviceParam mwapi:language "en" .
        ?artistId wikibase:apiOutput mwapi:item .
      }

      ?artistId wdt:P31 wd:Q5 . # Must be a human

      { ?artistId ?p ?artistEntity . }
      UNION
      { ?artistEntity ?p ?artistId . }

      ?artistEntity wdt:P31 wd:Q5 ;
                    rdfs:label ?artistLabel .
      FILTER(LANG(?artistLabel) = "en") .

      ?linkType wikibase:directClaim ?p .
      ?linkType rdfs:label ?linkTypeLabel .
      FILTER(LANG(?linkTypeLabel) = "en") .

      FILTER (?p IN (wdt:${properties.join(', wdt:')}))
    } LIMIT 20`;

    try {
        const response = await axios.get(WIKIDATA_API_URL, {
            params: {
                query: sparqlQuery,
                format: 'json'
            },
            headers: {
                'Accept': 'application/sparql-results+json'
            }
        });

        const collaborators = response.data.results.bindings.map(binding => ({
            name: binding.artistLabel.value,
            linkingTrackName: `Wikidata: ${binding.linkTypeLabel.value}`,
            id: binding.artist.value.split('/').pop() // Extract Q-ID
        }));

        return collaborators;
    } catch (error) {
        console.error('Error fetching from Wikidata:', error.message);
        return [];
    }
};

/**
 * Fetches collaborators from Genius API by looking at song features and producers.
 * @param {string} artistName - The name of the artist to search for.
 * @returns {Promise<Array>} A promise that resolves to an array of collaborator objects.
 */
const getGeniusCollaborators = async (artistName) => {
    if (!GENIUS_ACCESS_TOKEN) {
        console.warn("Genius API access token is missing. Skipping Genius search.");
        return [];
    }
    try {
        const searchResponse = await axios.get(`${GENIUS_API_URL}/search`, {
            headers: { Authorization: `Bearer ${GENIUS_ACCESS_TOKEN}` },
            params: { q: artistName }
        });

        const artistHit = searchResponse.data.response.hits.find(hit => hit.result.primary_artist.name.toLowerCase() === artistName.toLowerCase());

        if (!artistHit) return [];

        const artistId = artistHit.result.primary_artist.id;
        const songsResponse = await axios.get(`${GENIUS_API_URL}/artists/${artistId}/songs`, {
            headers: { Authorization: `Bearer ${GENIUS_ACCESS_TOKEN}` },
            params: { per_page: 20 }
        });

        const collaborators = new Map();
        for (const song of songsResponse.data.response.songs) {
            for (const artist of song.featured_artists) {
                if (!collaborators.has(artist.id)) {
                    collaborators.set(artist.id, { id: artist.id, name: artist.name, linkingTrackName: `Feat. on ${song.title}` });
                }
            }
        }
        return Array.from(collaborators.values());
    } catch (error) {
        console.error('Error fetching from Genius API:', error.message);
        return [];
    }
};

module.exports = {
    getWikidataCollaborators,
    getGeniusCollaborators,
};