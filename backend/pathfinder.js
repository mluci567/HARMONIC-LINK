// backend/pathfinder.js
const { findGeminiPath, generatePlaylist } = require('./gemini');

const findArtistPath = async (startArtistName, endArtistName) => {
    return await findGeminiPath(startArtistName, endArtistName);
};

module.exports = { findArtistPath, generatePlaylist };

/**  const { Pool } = require('pg');
const { generatePlaylist } = require('./gemini');

// --- PostgreSQL Configuration and Utilities ---
const dbConfig = {
    user: 'marusialuciuk', // Based on the schema owner provided in the prompt
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DATABASE || 'musicbrainz',
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT || 5432,
};
const pool = new Pool(dbConfig);

//Retrieves the internal database ID for an artist name.

const getArtistIdByName = async (artistName) => {
    // Using ILIKE for case-insensitive search
    const query = 'SELECT id FROM artist WHERE name ILIKE $1';
    const result = await pool.query(query, [artistName]);
    return result.rows.length > 0 ? result.rows[0].id : null;
};

//Finds all artists connected to a given artist via shared recordings or releases.
//This simulates the 'edge' traversal in the graph.

const getConnectedArtists = async (artistId) => {
    // Using a simplified query that looks for collaborators on a shared recording
    const collaboratorQuery = `
        SELECT DISTINCT a.id AS collaborator_id, a.name AS collaborator_name
        FROM artist a
        -- Assuming a table 'artist_recording' links artist and recording tables
        JOIN artist_recording ar_a ON a.id = ar_a.artist_id
        JOIN artist_recording ar_start ON ar_a.recording_id = ar_start.recording_id
        WHERE ar_start.artist_id = $1
          AND a.id != $1
    `;

    try {
        const result = await pool.query(collaboratorQuery, [artistId]);
        return result.rows.map(row => ({
            id: row.collaborator_id,
            name: row.collaborator_name
        }));
    } catch (error) {
        throw new Error(`Database query failed in getConnectedArtists: ${error.message}`);
    }
};

// --- Bidirectional BFS Implementation Helpers ---

//Reconstructs the shortest path from the meeting node.

const reconstructPath = (meetNode, parentMapStart, parentMapEnd) => {
    let path = [];
    let curr = meetNode;

    // Build path from start to meetNode (in reverse, then unshift)
    let pathFromStart = [];
    while (curr !== null) {
        pathFromStart.unshift(parentMapStart.get(curr).name);
        curr = parentMapStart.get(curr).parent;
    }

    // Reset and build path from end to meetNode (in forward order)
    let pathFromEnd = [];
    curr = meetNode;
    while (curr !== null) {
        // The path from end must be reconstructed from the end node back to its start node.
        pathFromEnd.push(parentMapEnd.get(curr).name);
        curr = parentMapEnd.get(curr).parent;
    }
    // Reverse the end path and combine (remove the duplicate meeting node)
    pathFromEnd.reverse();

    // The start path already contains the meeting node at the end.
    // The end path already contains the meeting node at the start.
    // Combining them requires removing the duplicate meeting node.
    path = pathFromStart.concat(pathFromEnd.slice(1));
    return path;
};


//Expands the current search queue and checks for a meeting point.

const expandQueue = async (queue, currentVisited, otherVisited) => {
    const nextQueue = [];
    const size = queue.length;

    for (let i = 0; i < size; i++) {
        const currentId = queue[i];

        const neighbors = await getConnectedArtists(currentId);

        for (const neighbor of neighbors) {
            const neighborId = neighbor.id;
            const neighborName = neighbor.name;

            if (otherVisited.has(neighborId)) {
                // Meeting point found
                currentVisited.set(neighborId, { parent: currentId, name: neighborName });
                return neighborId;
            }

            if (!currentVisited.has(neighborId)) {
                currentVisited.set(neighborId, { parent: currentId, name: neighborName });
                nextQueue.push(neighborId);
            }
        }
    }

    queue.splice(0, queue.length, ...nextQueue);
    return null;
};

// --- Main Pathfinding Function (Bidirectional BFS) ---

// Finds the shortest path between two artists using bidirectional BFS on the MusicBrainz graph.
// @param {string} startArtistName - The name of the starting artist.
// @param {string} endArtistName - The name of the target artist.
// @returns {Promise<Object>} An object containing the path array or an error message.

const findArtistPathBFS = async (startArtistName, endArtistName) => {
    const startArtistId = await getArtistIdByName(startArtistName);
    const endArtistId = await getArtistIdByName(endArtistName);

    if (!startArtistId || !endArtistId) {
        return [];
    }

    if (startArtistId === endArtistId) {
        return [startArtistName];
    }

    let queueStart = [startArtistId];
    let queueEnd = [endArtistId];

    // Maps: { artistId: { parent: parentArtistId, name: artistName } }
    let visitedStart = new Map();
    visitedStart.set(startArtistId, { parent: null, name: startArtistName });

    let visitedEnd = new Map();
    visitedEnd.set(endArtistId, { parent: null, name: endArtistName });
    
    let meetNode = null;

    while (queueStart.length > 0 && queueEnd.length > 0) {
        // Expand the smaller queue to optimize search
        if (queueStart.length <= queueEnd.length) {
            meetNode = await expandQueue(queueStart, visitedStart, visitedEnd);
            if (meetNode) {
                return reconstructPath(meetNode, visitedStart, visitedEnd);
            }
        } else {
            meetNode = await expandQueue(queueEnd, visitedEnd, visitedStart);
            if (meetNode) {
                // Path must be reconstructed from the opposite perspective
                return reconstructPath(meetNode, visitedStart, visitedEnd);
            }
        }
    }

    return []; // Path not found
};

// --- Module Exports Update ---


//Public function to find the artist path, replacing the Gemini implementation.
 //Ensures the API contract of the original file is maintained.

const findArtistPath = async (startArtistName, endArtistName) => {
    try {
        const path = await findArtistPathBFS(startArtistName, endArtistName);
        if (path.length > 0) {
            return { path };
        }
        return { path: null, message: "No path found between artists." };
    } catch (error) {
        return { path: null, error: error.message };
    }
};

// The generatePlaylist function remains for compatibility
module.exports = { findArtistPath, generatePlaylist }; */