from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
from agents import Runner, trace
from models import init_openai, get_one_day_one_ai_agent, get_linkedin_generator_agent
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

print("Initializing OpenAI client...")
openai_client = init_openai()
print("OpenAI client initialized successfully.")

@app.get("/one-day-one-ai")
async def one_day_one_ai():

    print("Initializing OneDayOneAIAgent...")
    one_day_one_ai_agent = get_one_day_one_ai_agent(openai_client)
    print("OneDayOneAIAgent initialized successfully.")

    try:
        print("Starting AI Learning Workflow...")
        with trace(workflow_name="AI Learning Workflow"):
            print("Running OneDayOneAIAgent...")
            workflow_input = "Select a random topic from AI terms list and generate descriptions, insights, and quizzes for the selected topic."
            workflow_result = await Runner.run(one_day_one_ai_agent, input=workflow_input)
            print("Workflow completed successfully.")

            # Parse the result
            print("Result: ", workflow_result.final_output)
            result = json.loads(workflow_result.final_output)
            return result
    except Exception as e:
        print("Error occurred during AI Learning Workflow:", str(e))
        return {"error": str(e)}

@app.post("/ask-question")
async def ask_question_endpoint(
    question: str = Body(..., description="The question to ask"),
    context: dict = Body(..., description="The context for the question")
):
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

    linkedin_generator_agent = get_linkedin_generator_agent(openai_client)

    try:
        print("Running LinkedIn Generator Agent...")
        with trace(workflow_name="LinkedIn Post Generation Workflow"):
            response_result = await Runner.run(linkedin_generator_agent, input="Generate a LinkedIn post based on the latest AI news.")
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