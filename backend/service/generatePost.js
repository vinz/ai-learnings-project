const { AzureKeyCredential } = require('@azure/core-auth');
const ModelClient = require('@azure-rest/ai-inference').default;
const { JSDOM } = require('jsdom');

const endpoint = process.env.AZURE_ENDPOINT;
const modelName = "gpt-4o";
const RSS_URL = "https://news.google.com/rss/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRGRqTVhZU0JXVnVMVWRDR2dKSlRpZ0FQAQ/sections/CAQiR0NCQVNMd29JTDIwdk1EZGpNWFlTQldWdUxVZENHZ0pKVGlJTkNBUWFDUW9ITDIwdk1HMXJlaW9KRWdjdmJTOHdiV3Q2S0FBKi4IACoqCAoiJENCQVNGUW9JTDIwdk1EZGpNWFlTQldWdUxVZENHZ0pKVGlnQVABUAE?hl=en-IN&gl=IN&ceid=IN%3Aen";

async function fetchRSSFeed(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.text();
}

function parseRSSFeed(xmlContent) {
  const dom = new JSDOM(xmlContent, { contentType: "text/xml" });
  const document = dom.window.document;
  const items = document.querySelectorAll("item");
  const newsItems = [];

  items.forEach((item, index) => {
    if (index < 10) {
      const title = item.querySelector("title")?.textContent?.trim() || "No title";
      const link = item.querySelector("link")?.textContent?.trim() || "No link available";
      const description = item.querySelector("description")?.textContent?.trim() || "No description";
      const pubDate = item.querySelector("pubDate")?.textContent?.trim() || "No date";
      const creator = item.querySelector("dc\\:creator, creator")?.textContent?.trim() || "Unknown author";

      newsItems.push({
        title,
        link,
        description,
        pubDate,
        creator
      });
    }
  });

  return newsItems;
}

async function generatePost() {
  console.log('Fetching RSS feed...');
  const rssContent = await fetchRSSFeed(RSS_URL);
  console.log('RSS feed fetched successfully.');

  console.log('Parsing RSS feed...');
  const newsItems = parseRSSFeed(rssContent);
  console.log(`Parsed ${newsItems.length} news items.`);

  if (newsItems.length === 0) {
    console.log('No news items found.');
    return { post: "No news items found." };
  }

  console.log('Formatting news items into text...');
  const newsText = newsItems.map((item, index) => {
    return `${index + 1}. Title: ${item.title}\n   Link: ${item.link}\n   Description: ${item.description}\n   Published: ${item.pubDate}\n   Author: ${item.creator}\n   ---`;
  }).join('\n\n');

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
          content: "You are a helpful assistant that creates engaging summaries of AI news articles. Focus on making the summaries informative and accessible." 
        },
        { 
          role: "user", 
          content: `
Please create an engaging summary of these AI news articles given to you from Google News RSS. 

RSS contains items in below format:
"""
<item>
<title>Gemini CLI: your open-source AI agent - Google Blog</title>
<link>https://news.google.com/rss/articles/CBMijwFBVV95cUxOVlZka183UUZZSXR1dHd5SHlUdUVnakFCbXZtaUVVQXFFaUtrdjlBbi10M1NGNzRVeVgwblNtRERvVkNBMjFtenBYanVzTUstR0xjVk1MMWtycENrV2d5NWVLUGo1YS0xWHNVMEJTcm1YSzdQY0dmN2kwbzVJZzljM1BKdXhhc1pjcVhvLVNJTQ?oc=5</link>
<guid isPermaLink="false">CBMijwFBVV95cUxOVlZka183UUZZSXR1dHd5SHlUdUVnakFCbXZtaUVVQXFFaUtrdjlBbi10M1NGNzRVeVgwblNtRERvVkNBMjFtenBYanVzTUstR0xjVk1MMWtycENrV2d5NWVLUGo1YS0xWHNVMEJTcm1YSzdQY0dmN2kwbzVJZzljM1BKdXhhc1pjcVhvLVNJTQ</guid>
<pubDate>Wed, 25 Jun 2025 13:15:26 GMT</pubDate>
<description><ol><li><a href="https://news.google.com/rss/articles/CBMijwFBVV95cUxOVlZka183UUZZSXR1dHd5SHlUdUVnakFCbXZtaUVVQXFFaUtrdjlBbi10M1NGNzRVeVgwblNtRERvVkNBMjFtenBYanVzTUstR0xjVk1MMWtycENrV2d5NWVLUGo1YS0xWHNVMEJTcm1YSzdQY0dmN2kwbzVJZzljM1BKdXhhc1pjcVhvLVNJTQ?oc=5" target="_blank">Gemini CLI: your open-source AI agent</a>&nbsp;&nbsp;<font color="#6f6f6f">Google Blog</font></li></ol></description>
<source url="https://blog.google">Google Blog</source>
</item>
...
"""

You should filter posts in the RSS feed only post the time stamp ${ new Date(new Date().getTime() - (24*60*60*1000)) } on the field pubDate.
Then rank which you think is going to be most popular for audience (Senior Software engineer aspiring to get into field of AI) and filter top 10 news. Prioritize news from Microsoft, OpenAI, Google and Apple in this order if news is available regarding them.

Return a valid JSON object in the following format:
{
  "response": [
  {
  "heading": "Headline 1",
  "summary": "two line summary",
  "source": "<valid link extracted from rss for this headline>"
  },
  ...
  ]
}

Ensure the response includes exactly 10 news items in the "response" array.

Do not include response as string enclosed in \`\`\`json \`\`\` instead just return valid JSON object like { response: [ ... ]}

Here are the articles:

${newsText}` 
        }
      ],
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 1,
      model: modelName
    }
  });

  console.log('Received response from Azure OpenAI API.');
  console.log('Response status:', response.status);
  console.log('Response:', response.body.choices[0].message.content);

  if (response.status != 200) {
    console.error('Error from Azure OpenAI API:', response.body.error);
    throw response.body.error;
  }

  let rawResponse = response.body.choices[0].message.content;
  if (rawResponse.startsWith('```json') && rawResponse.endsWith('```')) {
      rawResponse = rawResponse.slice(7, -3).trim();
  }
  const post = JSON.parse(rawResponse).response;
  console.log('Generated post successfully.');
  return { response: post };
}

module.exports = generatePost;
