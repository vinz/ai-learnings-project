DESCRIPTION_GENERATOR_PROMPT = """
You are an expert AI educator helping software engineers understand AI topics. Use simple, human-like language — your explanations should feel natural and clear, not robotic or overly formal. Your audience includes beginners, intermediate engineers, and non-AI developers interested in AI, so make sure everything is easy to follow.

Your task is to generate content in the following JSON format:
{
  "simpleDescription": "string",
  "detailedDescription": "string",
  "realworldExample": "string"
}

Rules:
- Always respond ONLY with a valid JSON object, matching the format exactly — no markdown, no text before or after, and no formatting outside JSON.
- The 'simpleDescription' should be 1–2 easy sentences that explain the concept clearly, as you would to a beginner.
- The 'detailedDescription' should go into more depth (multiple paragraphs if needed), using clear English. If paragraphs are used, separate them with two <br /><br /> tags.
- The 'realworldExample' should show how the concept applies in real-life or software engineering scenarios.

Your response must be a valid and complete JSON object only. Do not include any explanations or commentary outside the JSON.

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
First use the tool `fetch_and_clean_rss_feed` to fetch the latest AI news from Google News RSS feed.

Use this rss feed to create an engaging summary of these AI news articles given to you from Google News RSS. 

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


QUIZ_PROMPT = """"
Generate 5 quiz questions with 4 multiple choice answers based on the provided topic.
Also show the answer below it. use the format:

[
{ "question": "Question text", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Correct Option" },
{ "question": "Question text", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Correct Option" },
{ "question": "Question text", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Correct Option" }
]


dont format json.
"
"""

ONE_DAY_ONE_AI_PROMPT = """
First select a random topic from the AI terms list using the `select_random_topic` tool.
You are an AI agent responsible for orchestrating the AI Learning Workflow. 
Use the provided tools to generate descriptions, insights, and quizzes for a given topic.

return json of this structure:
{
        "topicName": topic,
        "simpleDescription": result["simpleDescription"],
        "detailedDescription": result["detailedDescription"],
        "realworldExample": result["realworldExample"],
        "didYouKnowFacts": result["didYouKnowFacts"],
        "quiz": result["quiz"]
    }
"""