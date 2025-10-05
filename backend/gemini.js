// backend/gemini.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to find a path between two artists using the Gemini API
const findGeminiPath = async (startArtistName, endArtistName) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `Find a short and interesting collaboration path between '${startArtistName}' and '${endArtistName}'. A collaboration can be a direct feature on a song, being part of the same band, a production credit, or a well-documented musical relationship. For each step in the path, provide the artist's name, the type of link (e.g., "Featured on", "Member of", "Produced"), and the specific details (e.g., song name, band name, album name). Present the path as a JSON array of objects. Each object should have three properties: "artist", "link_type", and "details". The first artist in the path should be '${startArtistName}' and should not have a link_type or details.

    Example:
    Start: Artist A
    End: Artist D
    Result:
    [
      {
        "artist": "Artist A",
        "link_type": null,
        "details": null
      },
      {
        "artist": "Artist B",
        "link_type": "Featured on",
        "details": "Song Title"
      },
      {
        "artist": "Artist C",
        "link_type": "Member of",
        "details": "Band Name"
      },
      {
        "artist": "Artist D",
        "link_type": "Produced",
        "details": "Album Title"
      }
    ]`;

    try {
        console.log("Searching for a unique path...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const path = JSON.parse(jsonString);
        return path;

    } catch (error) {
        console.error("Error processing Gemini response for path:", error);
        return null;
    }
};

// Updated function to generate a playlist of songs using the Gemini API
const generatePlaylist = async (path) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const artistNames = path.map(p => p.name).join(', ');

    const prompt = `Generate a playlist of 10-12 songs representing the musical path: ${artistNames}. Include 2-3 popular songs from each artist in the path. The final output must be only a valid JSON array of objects. Each object must have exactly two properties: "title" (string) and "artist" (string). Do not include any text or markdown formatting before or after the JSON array.

    Example response format:
    [
      {
        "title": "Song Title 1",
        "artist": "Artist Name A"
      },
      {
        "title": "Song Title 2",
        "artist": "Artist Name B"
      }
    ]`;

    try {
        console.log("Generating playlist with Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const playlistTracks = JSON.parse(jsonString);
        return playlistTracks;
    } catch (error) {
        console.error("Error processing Gemini response for playlist:", error);
        // Return a fallback playlist on error
        return [{ title: "Could not generate playlist", artist: "Please try again" }];
    }
};

module.exports = { findGeminiPath, generatePlaylist };