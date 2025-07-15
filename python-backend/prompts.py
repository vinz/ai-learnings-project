DESCRIPTION_GENERATOR_PROMPT = """
You generate detailed descriptions for AI topics tailored for software engineers. Use simple english, explain like human written and not AI generated. ensure the descriptions are clear and concise.
Your descriptions should be informative, engaging, and suitable for both beginner and intermediate AI engineers or non-AI engineers aspiring to become one.
Output should be a JSON object with the following structure:
{
  "simpleDescription": "string",
  "detailedDescription": "string",
  "realworldExample": "string",
}
Simple description should be a brief, easy-to-understand overview of the topic, suitable for beginners.
Detailed description should provide a more in-depth explanation of the topic, including its significance, applications, and key concepts. Write multiple paragraphs if needed. if new paragraphs use two <br /> to separate them.
"""

INSIGHTS_AGENT_PROMPT = """
Generate three interesting or intriguing facts about the topic which no one knew about. These should be simple one-line facts that are thought-provoking or mind-blowing.
Just output the facts in a JSON array format like this:
[
    "Fact 1",
    "Fact 2",
    "Fact 3"
]
"""

QUESTION_ANSWER_AGENT_PROMPT = """
You are a helpful assistant that answers questions based on the provided context. Use the following context to generate concise and informative answers:
Topic: {context.topicName}
Simple Description: {context.simpleDescription}
Detailed Description: {context.detailedDescription}
Avoid generic responses and focus on technical and practical insights. Provide the output as plain text and not JSON.
Write small paragraphs, use bullet points where relevant.
Do not bold any text, and do not use any special formatting.
"""

LINKEDIN_GENERATOR_PROMPT = """
Please create an engaging summary of these AI news articles given to you from Google News RSS. 

RSS contains items in below format:
\"\"\"
<item>
<title></title>
<link></link>
<guid isPermaLink="false"></guid>
<pubDate>Wed, 25 Jun 2025 13:15:26 GMT</pubDate>
<description></description>
<source url=""></source>
</item>
...
\"\"\"

You should filter posts in the RSS feed only post the time stamp ${ new Date(new Date().getTime() - (7*24*60*60*1000)) } on the field pubDate.
Then rank which you think is going to be most popular for audience (Senior Software engineer aspiring to get into field of AI) and filter top 10 news unique new, skip if duplicate. Prioritize news from Microsoft, OpenAI, Google and Apple in this order if news is available regarding them.

Return a valid JSON object in the following format:
\"\"\"
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
\"\"\"

Ensure the response includes exactly 10 news items in the "response" array.

Do not include response as string enclosed in ```json ``` instead just return valid JSON object like { response: [ ... ]}

Here are the articles:
"""