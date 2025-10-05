# HARMONIC-LINK

## Project Overview

Harmonic Link is a web application designed to uncover and visualize musical connections, referred to as "harmonic links," between any two specified artists. The core functionality combines advanced graph traversal algorithms with generative AI capabilities to identify the shortest collaborative path and automatically create a curated playlist that reflects that artistic journey.

---

## Architecture and Components

The application utilizes a classic client-server architecture with a Node.js backend serving as the central API layer.

| Component | Technology / Language | Primary Role |
| :--- | :--- | :--- |
| **Backend Server** | Node.js, Express.js | Manages RESTful API endpoints (`/api/search`, `/api/path`, `/api/playlist`) and handles CORS and JSON middleware. Runs on port `3001`. |
| **Pathfinding Logic** | JavaScript, PostgreSQL (`pg`) | Implements the core graph traversal algorithm to find the shortest connection between artists. |
| **Data Storage** | PostgreSQL | Used to store the underlying music graph data, including artists and their collaborations/releases. The default database name is `musicbrainz`. |
| **External APIs (Metadata)** | Spotify, Genius (via `axios`) | Handles artist search, API authentication, and fetches artist metadata like names, IDs, and image URLs for visualization. |
| **Generative AI** | Google Generative AI (`@google/generative-ai`) | Utilized for the creative task of generating a contextualized playlist based on the found path. |

---

## Core Functionality and Logic

### 1. Artist Search (`GET /api/search`)

This endpoint searches for artists using a query string. It leverages the **Spotify API** to perform the lookup, returning a list of artists with their names, IDs, and a relevant image URL.

### 2. Harmonic Path Logic (`POST /api/path`)

The pathfinding is the central logic for finding the connection between two artists.

* **Search Method:** The project employs a **Bidirectional Breadth-First Search (BFS)** algorithm (`findArtistPathBFS`) implemented in `pathfinder.js`.
* **Graph Definition:**
    * **Nodes:** Individual artists.
    * **Edges (Connections):** A connection exists between two artists if they share a common recording or release, simulating collaboration or association. The database queries (`getConnectedArtists`) are designed to find collaborators via a shared recording ID.
* **Goal:** The bidirectional BFS efficiently finds the **shortest path** of collaboration links between the starting and ending artists.
* **Output Processing:** Once the path (an array of artist names) is found, the backend iterates through the artists and uses the **Spotify API's `getArtist` function** to fetch display information, including a public image URL, before returning the final structured path to the client.

### 3. Playlist Generation (`POST /api/playlist`)

This function generates a playlist that encapsulates the musical journey found by the pathfinder.

* **AI Model:** It utilizes the **Gemini 2.5 Pro** model.
* **Process:** The model is provided with the full sequence of artist names from the discovered path.
* **Output:** The model generates a list of 10-12 songs, including 2-3 popular tracks from each artist in the path, structured as a JSON array of `title` and `artist` objects.

---

## Configuration

The backend environment relies on the following variables, typically loaded via a `.env` file, for external API authentication and database connection:

| Service | Environment Variables | Description |
| :--- | :--- | :--- |
| **Database** | `PG_HOST`, `PG_DATABASE`, `PG_PASSWORD`, `PG_PORT` | Credentials for connecting to the PostgreSQL database instance. |
| **Spotify API** | `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` | Client credentials needed to obtain an access token for Spotify's Web API. |
| **Gemini API** | `GEMINI_API_KEY` | The API key required for authenticating requests to the Google Generative AI model. |

***Note on Data Sources:*** The core musicological relationship data (the "graph" or "links" between artists) is sourced from the **MusicBrainz database**. External APIs (Spotify, Genius, Gemini) are used for supplementary data (images, tracks) and content generation. 