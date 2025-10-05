// backend/pathfinder.js
const { findGeminiPath, generatePlaylist } = require('./gemini');

// This function now directly calls the Gemini pathfinder
const findArtistPath = async (startArtistName, endArtistName) => {
    return await findGeminiPath(startArtistName, endArtistName);
};

// The generatePlaylist function is now imported from gemini.js and re-exported
module.exports = { findArtistPath, generatePlaylist };