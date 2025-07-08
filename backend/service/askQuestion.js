const { AzureKeyCredential } = require('@azure/core-auth');
const ModelClient = require('@azure-rest/ai-inference').default;

const endpoint = process.env.AZURE_ENDPOINT;
const modelName = process.env.AZURE_MODEL_NAME;

async function askQuestion(question, context) {
  try {
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
            content: `You are a helpful assistant that answers questions based on the provided context. Use the following context to generate concise and informative answers:

Topic: ${context.topicName}
Simple Description: ${context.simpleDescription}
Detailed Description: ${context.detailedDescription}

Avoid generic responses and focus on technical and practical insights. Provide the output as plain text and not JSON.

Write small paragraphs, use bullet points where relevant.
Do not bold any text, and do not use any special formatting.

`
          },
          {
            role: "user",
            content: `Question: ${question}`
          }
        ],
        max_tokens: 1024,
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

    const answer = response.body.choices[0].message.content;
    console.log('Generated answer successfully:', answer);
    return answer;
  } catch (error) {
    console.error('Error processing question:', error);
    throw new Error('Failed to process the question.');
  }
}

module.exports = askQuestion;
