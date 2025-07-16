from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import random
import json
from agents import Runner, trace
from models import init_openai, get_onedayoneai_agents, load_ai_terms, get_linkedin_generator_agent
from datetime import datetime, timedelta
import requests
from bs4 import BeautifulSoup

# Create FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/one-day-one-ai")
async def one_day_one_ai():
    print("Initializing OpenAI client...")
    openai_client = init_openai()
    print("OpenAI client initialized successfully.")

    print("Loading AI terms...")
    ai_terms = load_ai_terms()
    # print(f"AI terms loaded: {ai_terms}")

    print("Initializing agents...")
    description_generator_agent, insights_agent, _, quiz_agent = get_onedayoneai_agents(openai_client)
    print("Agents initialized successfully.")

    try:
        print("Starting AI Learning Workflow...")
        with trace(workflow_name="AI Learning Workflow"):
            print("Selecting a random topic from AI terms...")
            topic = random.choice(ai_terms)
            print(f"Selected topic: {topic}")

            print("Generating descriptions for the topic...")
            description_result = await Runner.run(description_generator_agent, input=f"Generate descriptions for the topic: {topic}")
            print("Descriptions generated successfully.")
            print("Description result:", description_result.final_output)
            descriptions = json.loads(description_result.final_output)

            print("Generating insights for the topic...")
            insights_result = await Runner.run(insights_agent, input=f"Provide intriguing or mind-blowing facts about the topic: {topic}")
            print("Insights generated successfully.")
            insights = json.loads(insights_result.final_output)

            print("Generating quiz for the topic...")
            quiz_result = await Runner.run(quiz_agent, input=f"Generate a quiz for the topic: {topic}. More details on the topic here: {description_result.final_output}")
            print("Quiz generated successfully.")
            quiz = json.loads(quiz_result.final_output)

        print("AI Learning Workflow completed successfully.")
        return {
            "topicName": topic,
            "simpleDescription": descriptions["simpleDescription"],
            "detailedDescription": descriptions["detailedDescription"],
            "realworldExample": descriptions["realworldExample"],
            "didYouKnowFacts": insights,
            "quiz": quiz
        }
    except Exception as e:
        print("Error occurred during AI Learning Workflow:", str(e))
        return {"error": str(e)}

@app.post("/ask-question")
async def ask_question_endpoint(
    question: str = Body(..., description="The question to ask"),
    context: dict = Body(..., description="The context for the question")
):
    openai_client = init_openai()
    _, _, question_answer_agent = get_onedayoneai_agents(openai_client)
    try:
        with trace(workflow_name="Ask Question Workflow"):
            response_result = await Runner.run(question_answer_agent, input=f"Question: {question}\nContext: {json.dumps(context)}")
            response = response_result.final_output
        return {"answer": response}
    except Exception as e:
        return {"error": str(e)}

@app.get("/generate-post")
async def generate_post():
    print("Starting LinkedIn post generation...")
    RSS_URL = "https://news.google.com/rss/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRGRqTVhZU0JXVnVMVWRDR2dKSlRpZ0FQAQ/sections/CAQiR0NCQVNMd29JTDIwdk1EZGpNWFlTQldWdUxVZENHZ0pKVGlJTkNBUWFDUW9ITDIwdk1HMXJlaW9KRWdjdmJTOHdiV3Q2S0FBKi4IACoqCAoiJENCQVNGUW9JTDIwdk1EZGpNWFlTQldWdUxVZENHZ0pKVGlnQVABUAE?hl=en-IN&gl=IN&ceid=IN%3Aen"

    def fetch_rss_feed(url):
        response = requests.get(url)
        response.raise_for_status()
        return response.text

    openai_client = init_openai()
    linkedin_generator_agent = get_linkedin_generator_agent(openai_client)

    try:
        print("Fetching RSS feed...")
        rss_content = fetch_rss_feed(RSS_URL)
        print("RSS feed fetched successfully.")

        # remove description tags from the RSS content - this will reduce the size of the RSS feed sent to the agent
        soup = BeautifulSoup(rss_content, "xml")
        for desc in soup.find_all("description"):
            desc.decompose()
        rss_content = str(soup)


        print("Running LinkedIn Generator Agent...")
        with trace(workflow_name="LinkedIn Post Generation Workflow"):
            response_result = await Runner.run(linkedin_generator_agent, input=rss_content)
            response = response_result.final_output

        print("Generated LinkedIn post successfully.")
        # Remove starting ```json and ending ``` if the response starts with ```json
        if response.startswith("```json"):
            response = response[7:]  # Remove starting ```json
            response = response.rstrip("```")  # Remove ending ```
        # Parse the response as JSON
        parsed_response = json.loads(response)
        return parsed_response

    except Exception as e:
        print("Error:", str(e))
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)