const fs = require('fs'); // Import file system module
const path = require('path'); // Import path module
const { AzureKeyCredential } = require('@azure/core-auth');
const ModelClient = require('@azure-rest/ai-inference').default;

const endpoint = process.env.AZURE_ENDPOINT;
const modelName = "gpt-4o";

async function getRandomTopic() {
  try {
    console.log('Starting getRandomTopic function...');

    const filePath = path.join(__dirname, 'aiTerms.json');
    console.log(`Reading AI terms from file: ${filePath}`);

    const data = fs.readFileSync(filePath, 'utf-8'); // Read the JSON file
    console.log('Successfully read AI terms file.');

    const topics = JSON.parse(data); // Parse the JSON data

    if (Array.isArray(topics) && topics.length > 0) {
      console.log('Topics array is valid and has elements.');

      const randomTopic = topics[Math.floor(Math.random() * topics.length)]; // Pick a random topic
      console.log(`Selected random topic: ${randomTopic}`);

      if (randomTopic) {
        console.log('Initializing Azure ModelClient...');
        const client = new ModelClient(
          endpoint,
          new AzureKeyCredential(process.env.AZURE_API_KEY)
        );

        console.log('Sending request to Azure OpenAI API...');
        const response = await client.path("/chat/completions").post({
          body: {
            messages: [
              {
                role: "system",
                content: `You are a helpful assistant that generates descriptions for AI topics. The descriptions should be tailored for a senior software engineer who is trying to upskill on artificial intelligence by learning one topic every day. Avoid generic English meanings and focus on providing technical and practical insights relevant to artificial intelligence. Provide the output as a JSON object with the following structure:
{
  "simpleDescription": "string",
  "detailedDescription": "string",
  "didYouKnowFacts": ["string", "string", "string"]
}
Use Simple English and Examples where relevant, and ensure the descriptions are concise yet informative. The output should be a JSON object with the keys "simpleDescription", "detailedDescription", and "didYouKnowFacts".

Detailed description can have multiple paragraphs, use examples where relevant.

Additionally, generate three interesting or intriguing facts about the topic which no one knew about. These should be simple one-line facts that are thought-provoking or mind-blowing.`
              },
              {
                role: "user",
                content: `Generate descriptions for the topic: ${randomTopic}`
              }
            ],
            max_tokens: 2048,
            temperature: 0.7,
            model: modelName
          }
        });

        console.log('Received response from Azure OpenAI API.');
        console.log('Response status:', response.status);

        if (response.status != 200) {
          console.error('Error from Azure OpenAI API:', response.body.error);
          throw response.body.error;
        }

        console.log('Processing response content...');
        let rawResponse = response.body.choices[0].message.content;
        if (rawResponse.startsWith('```json') && rawResponse.endsWith('```')) {
          rawResponse = rawResponse.slice(7, -3).trim();
        }
        const responseData = JSON.parse(rawResponse);
        let { simpleDescription, detailedDescription, didYouKnowFacts } = responseData;

        // replace new line with <br> for HTML compatibility
        detailedDescription = detailedDescription.replace(/\n/g, '<br>');

        console.log('Generated descriptions successfully.', {
          topicName: randomTopic,
          simpleDescription,
          detailedDescription,
          didYouKnowFacts,
        });
        return {
          topicName: randomTopic,
          simpleDescription,
          detailedDescription,
          didYouKnowFacts,
        };
      } else {
        console.error('Invalid topic structure.');
        throw new Error('Invalid topic structure.');
      }
    } else {
      console.error('No topics available.');
      throw new Error('No topics available.');
    }
  } catch (error) {
    console.error('Error reading AI terms or generating descriptions:', error);
    throw new Error('Failed to fetch a random topic.');
  }
}

module.exports = getRandomTopic;