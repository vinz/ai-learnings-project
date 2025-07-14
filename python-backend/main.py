from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import random
import json
from agents import Runner, trace
from models import init_openai, get_agents, load_ai_terms

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
    openai_client = init_openai()
    ai_terms = load_ai_terms()
    description_generator_agent, insights_agent, _ = get_agents(openai_client)
    try:
        with trace(workflow_name="AI Learning Workflow"):
            topic = random.choice(ai_terms)
            description_result = await Runner.run(description_generator_agent, input=f"Generate descriptions for the topic: {topic}")
            descriptions = json.loads(description_result.final_output)
            insights_result = await Runner.run(insights_agent, input=f"Provide intriguing or mind-blowing facts about the topic: {topic}")
            insights = json.loads(insights_result.final_output)
        return {
            "topicName": topic,
            "simpleDescription": descriptions["simpleDescription"],
            "detailedDescription": descriptions["detailedDescription"],
            "realworldExample": descriptions["realworldExample"],
            "didYouKnowFacts": insights
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/ask-question")
async def ask_question_endpoint(
    question: str = Body(..., description="The question to ask"),
    context: dict = Body(..., description="The context for the question")
):
    openai_client = init_openai()
    _, _, question_answer_agent = get_agents(openai_client)
    try:
        with trace(workflow_name="Ask Question Workflow"):
            response_result = await Runner.run(question_answer_agent, input=f"Question: {question}\nContext: {json.dumps(context)}")
            response = response_result.final_output
        return {"answer": response}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)