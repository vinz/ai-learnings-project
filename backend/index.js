require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors'); // Import CORS middleware
const generatePost = require('./service/generatePost');
const getRandomTopic = require('./service/oneDayOneAI'); // Update to use oneDayOneAI.js
const askQuestion = require('./service/askQuestion'); // Import the askQuestion service

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

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

// New POST route for /ask-question
app.post('/ask-question', async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question || !context) {
      return res.status(400).json({ error: 'Question and context are required.' });
    }

    const answer = await askQuestion(question, context);
    res.json({ answer });
  } catch (error) {
    console.error('Error processing ask-question request:', error);
    res.status(500).json({ error: 'Failed to process the question.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
