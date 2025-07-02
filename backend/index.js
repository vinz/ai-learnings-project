require('dotenv').config(); // Load environment variables

const express = require('express');
const ModelClient = require('@azure-rest/ai-inference').default;
const { AzureKeyCredential } = require('@azure/core-auth');
const { JSDOM } = require('jsdom');
const cors = require('cors'); // Import CORS middleware

const app = express();
app.use(cors()); // Enable CORS for all routes

const PORT = 5000;

// Existing logic from the original index.js
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

app.get('/generate-post', async (req, res) => {
  try {
    console.log('Fetching RSS feed...');
    const rssContent = await fetchRSSFeed(RSS_URL);
    console.log('RSS feed fetched successfully.');

    console.log('Parsing RSS feed...');
    const newsItems = parseRSSFeed(rssContent);
    console.log(`Parsed ${newsItems.length} news items.`);

    if (newsItems.length === 0) {
      console.log('No news items found.');
      return res.json({ post: "No news items found." });
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
<description><ol><li><a href="https://news.google.com/rss/articles/CBMijwFBVV95cUxOVlZka183UUZZSXR1dHd5SHlUdUVnakFCbXZtaUVVQXFFaUtrdjlBbi10M1NGNzRVeVgwblNtRERvVkNBMjFtenBYanVzTUstR0xjVk1MMWtycENrV2d5NWVLUGo1YS0xWHNVMEJTcm1YSzdQY0dmN2kwbzVJZzljM1BKdXhhc1pjcVhvLVNJTQ?oc=5" target="_blank">Gemini CLI: your open-source AI agent</a>&nbsp;&nbsp;<font color="#6f6f6f">Google Blog</font></li><li><a href="https://news.google.com/rss/articles/CBMiiwFBVV95cUxOM2FMR3M0amVyWmY4eG9FRkpEWnV4dEdQUThlaUh2SG9MUzZnajF5S1hCM1dUclZNejc1SGdDR1FJd1BaSHVnVE5xQ09OY3FicG5fSmU4X011cEY1SC10NlFPa0FLSHM2WTJSWFR0RktKY3RxT1k0UHQ3QkRHTERUUU5XVjJUUUVvUm5V?oc=5" target="_blank">Is Google Driving the Cost of GenAI to $0?</a>&nbsp;&nbsp;<font color="#6f6f6f">Analytics India Magazine</font></li><li><a href="https://news.google.com/rss/articles/CBMipAFBVV95cUxQR2ItWndwUkZmZUZWN2VUWVA4Y2hVcGliMy1nVzB2RFd6OWtSRTdHM1FJZThpZjEwcllLWUk1bk92blp2R1lmQUdmZWZDREhXbHptcmVwNDhiLU00UDdKUmgwbEduRURtZXJobjczc0JLWnpYMHdxYUllUkdfRS00Y2RycU9YZ04xRWlpYjQ5R1BKMV9SR1ZMbUV4ek90c09VdHp2V9IBqgFBVV95cUxQSW1Cbm8wRVFqRjF5SWVBQTVheVJkTmNCVHFwOW5sbXpCQ05LTUZCNW4zcDVJRzZRcWtGNHplc0FvQ3paSV9DMUxzVzV4aWxhalZDZkQtc2IzbWZNWWlmTTItWWlkblYzamRWQ2ZHYTVoNnBpemh6MzZIa1lWOUNkMm16VjVCRnJQX1Fwak9hakU0TkthWDFLQ19CZHdtVmxiNnNzT09VUlJTQQ?oc=5" target="_blank">Google rolls out Gemini CLI for AI use directly in terminal | Tap to know more | Inshorts</a>&nbsp;&nbsp;<font color="#6f6f6f">Inshorts</font></li><li><a href="https://news.google.com/rss/articles/CBMitAFBVV95cUxQa2xfTTFXaU5GbkNocTNVbmE2TEtOVkpjQXhqQm82YmpsSmpYQXg5VzRtb0pJTXcyak1LYTZ5RXpzaFpTWU5YbS1EZEM3WmZTdnBSLVVBdjRvWUF4bGpNSXVSVDZOblU5cWlNSHR0Mjg2cUp3SVItMXdRQWx2dDhtQXg0X0YyQk9QOE5CQi16ZXJPVWlfZjVQaG5QWC14N0p5dEtXQjJRY2RBWUFSVWI1LVMtc3M?oc=5" target="_blank">Google Debuts Gemini AI Coding Tool in Bid to Entice Developers</a>&nbsp;&nbsp;<font color="#6f6f6f">Bloomberg.com</font></li><li><a href="https://news.google.com/rss/articles/CBMinAFBVV95cUxPZGRaZGFVUGwzOXlvLXZmbzZxbzRFci1aN0xUUzh6dEx6VGYxVEZGNFdRcm5nNzNmbnlYaHlXZ2R6bVk2NjluS1dXOTZjeERxTUJod19tUTVDT3RoU2EtZFFPeGZGVTF6T210dWVuMVVMNW9hSVhBclh4QXdqb2tCS25sNlZtNnFvdzljMFg3ZlFBZko2Qjd0MUlCSEk?oc=5" target="_blank">Gemini CLI: The Open-Source AI Agent That’s Revolutionizing Terminal Workflows</a>&nbsp;&nbsp;<font color="#6f6f6f">DevOps.com</font></li></ol></description>
<source url="https://blog.google">Google Blog</source>
</item>
<item>
<title>Realme 15 confirmed to launch soon in India, AI features teased: Details - Hindustan Times</title>
<link>https://news.google.com/rss/articles/CBMizgFBVV95cUxOUk53ZkFFbm5STElsVVFWZnRDTU9iR3IyaVVZdmh1T1VSVXdBZTdIcERycVREVmtNdlRaUDlVa216YTVZN1p3SFFXMFJ2VmJERTM1ZmFsUGEwNS1HSGhmLWMwWjFCTnBHOEtyTFQyZFBuZ1NaTno4enYyN3Z3TXphX3RrdUZHQkx5ajdlSUt0NXU3SlVHQnk3UlVYTmoyalI0YnFQTHFUTnlXMnJFa0gyYTdoQzRpdUZKbHVWazlWYWcyTlI1TzIydmV1T0N4Zw?oc=5</link>
<guid isPermaLink="false">CBMizgFBVV95cUxOUk53ZkFFbm5STElsVVFWZnRDTU9iR3IyaVVZdmh1T1VSVXdBZTdIcERycVREVmtNdlRaUDlVa216YTVZN1p3SFFXMFJ2VmJERTM1ZmFsUGEwNS1HSGhmLWMwWjFCTnBHOEtyTFQyZFBuZ1NaTno4enYyN3Z3TXphX3RrdUZHQkx5ajdlSUt0NXU3SlVHQnk3UlVYTmoyalI0YnFQTHFUTnlXMnJFa0gyYTdoQzRpdUZKbHVWazlWYWcyTlI1TzIydmV1T0N4Zw</guid>
<pubDate>Mon, 30 Jun 2025 13:46:27 GMT</pubDate>
<description><a href="https://news.google.com/rss/articles/CBMizgFBVV95cUxOUk53ZkFFbm5STElsVVFWZnRDTU9iR3IyaVVZdmh1T1VSVXdBZTdIcERycVREVmtNdlRaUDlVa216YTVZN1p3SFFXMFJ2VmJERTM1ZmFsUGEwNS1HSGhmLWMwWjFCTnBHOEtyTFQyZFBuZ1NaTno4enYyN3Z3TXphX3RrdUZHQkx5ajdlSUt0NXU3SlVHQnk3UlVYTmoyalI0YnFQTHFUTnlXMnJFa0gyYTdoQzRpdUZKbHVWazlWYWcyTlI1TzIydmV1T0N4Zw?oc=5" target="_blank">Realme 15 confirmed to launch soon in India, AI features teased: Details</a>&nbsp;&nbsp;<font color="#6f6f6f">Hindustan Times</font></description>
<source url="https://www.hindustantimes.com">Hindustan Times</source>
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
  {
  "heading": "Headline 2",
  "summary": "two line summary",
  "source": "<valid link extracted from rss for this headline>"
  },
  ...
  ]
}

Here's a sample response I expected from you:
{
  "response": [
    {
      "heading": "Microsoft Says Its New AI System Diagnosed Patients 4 Times More Accurately Than Human Doctors",
      "summary": "Microsoft is leveraging cutting-edge AI to revolutionize health care diagnostics, claiming unprecedented accuracy and cost-saving potential. The system was developed with talent poached from Google.",
      "source": "https://www.wired.com/story/microsoft-medical-superintelligence-diagnosis/"
    },
    {
      "heading": "Here Is Everyone Mark Zuckerberg Has Hired So Far for Meta’s ‘Superintelligence’ Team",
      "summary": "Meta is on a hiring spree, pulling top AI researchers from rivals like OpenAI, Anthropic, and Google to build its ambitious 'superintelligence' team. Zuckerberg's moves highlight the fierce competition for talent in AI research.",
      "source": "https://www.wired.com/story/mark-zuckerberg-welcomes-superintelligence-team/"
    },
    {
      "heading": "OpenAI Leadership Responds to Meta Offers: ‘Someone Has Broken Into Our Home’",
      "summary": "As Meta aggressively poaches OpenAI researchers, OpenAI’s leadership grapples with recalibrating compensation to retain their top talent. This rivalry underscores the growing tension in the AI industry.",
      "source": "https://www.wired.com/story/openai-meta-leadership-talent-rivalry/"
    }]
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
    res.json({ response: post });
  } catch (error) {
    console.error("Error generating post:", error);
    res.status(500).json({ error: "Failed to generate post." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
