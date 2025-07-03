require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors'); // Import CORS middleware
const generatePost = require('./service/generatePost');
const getRandomTopic = require('./service/oneDayOneAI'); // Update to use oneDayOneAI.js

const app = express();
app.use(cors()); // Enable CORS for all routes

const PORT = 5000;

// Existing logic from the original index.js
app.get('/generate-post', async (req, res) => {
  try {
    const result = await generatePost();
    res.json(result);
  } catch (error) {
    console.error("Error generating post:", error);
    res.status(500).json({ error: "Failed to generate post." });
  }
});

// Update the '/one-day-one-ai' route
app.get('/one-day-one-ai', async (req, res) => {
  try {
    const randomTopic = await getRandomTopic(); // Use the getRandomTopic function
    res.json({ topic: randomTopic });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
