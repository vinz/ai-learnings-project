from openai import AsyncAzureOpenAI
from agents import set_default_openai_client
from dotenv import load_dotenv
import os
from agents import Agent, HandoffInputData, Runner, function_tool, handoff, trace, set_default_openai_client, set_tracing_disabled, OpenAIChatCompletionsModel, set_tracing_export_api_key, add_trace_processor
import asyncio
import json
from fastapi import FastAPI, Body
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import random


# Load environment variables
load_dotenv()

# Define openai_client globally
openai_client = None

async def init_openai():
    global openai_client
    # Create OpenAI client using Azure OpenAI
    openai_client = AsyncAzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT",""),
        azure_deployment=os.getenv("AZURE_OPENAI_DEPLOYMENT")
    )

    # Set the default OpenAI client for the Agents SDK
    set_default_openai_client(openai_client)
    set_tracing_export_api_key(os.getenv("OPENAI_API_KEY",""))

    set_tracing_disabled(False)

# define agents globally
description_generator_agent = None
insights_agent = None
question_answer_agent = None
ai_terms = []

# AI Learning Workflow
async def init_ai_learning_workflow():
    global openai_client, description_generator_agent, insights_agent, question_answer_agent, ai_terms
    print("Starting AI Learning Workflow...")
    
    # Load AI terms from aiTerms.json
    with open("aiTerms.json", "r") as file:
        ai_terms = json.load(file)

    description_generator_agent = Agent(
        name="AIDescriptionGeneratorAgent",
        instructions="""
        
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

        """,
        model=OpenAIChatCompletionsModel(
            model="gpt-4.1",
            openai_client=openai_client,
        )
    )

    insights_agent = Agent(
        name="AIInsightsAgent",
        instructions="""
        Generate three interesting or intriguing facts about the topic which no one knew about. These should be simple one-line facts that are thought-provoking or mind-blowing.

        Just output the facts in a JSON array format like this:
        [
            "Fact 1",
            "Fact 2",
            "Fact 3"
        ]
        """,
        model=OpenAIChatCompletionsModel(
            model="gpt-4.1",
            openai_client=openai_client,
        )
    )

    question_answer_agent = Agent(
        name="AIQuestionAnswerAgent",
        instructions="""
        You are a helpful assistant that answers questions based on the provided context. Use the following context to generate concise and informative answers:

        Topic: {context.topicName}
        Simple Description: {context.simpleDescription}
        Detailed Description: {context.detailedDescription}

        Avoid generic responses and focus on technical and practical insights. Provide the output as plain text and not JSON.

        Write small paragraphs, use bullet points where relevant.
        Do not bold any text, and do not use any special formatting.
        """,
        model=OpenAIChatCompletionsModel(
            model="gpt-4.1",
            openai_client=openai_client,
        )
    )


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
    global description_generator_agent, insights_agent, ai_terms

    await init_openai()
    await init_ai_learning_workflow()
    try:
        with trace(workflow_name="AI Learning Workflow"):
            # Select a random topic from the list of AI terms
            topic = random.choice(ai_terms)

            description_result = await Runner.run(description_generator_agent, input=f"Generate descriptions for the topic: {topic}")
            descriptions = json.loads(description_result.final_output)
            print(f"\nDescriptions: {descriptions}\n")

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
    global description_generator_agent, insights_agent, question_answer_agent

    await init_openai()
    await init_ai_learning_workflow()
    try:
        with trace(workflow_name="Ask Question Workflow"):
            # Generate response using question_answer_agent
            response_result = await Runner.run(question_answer_agent, input=f"Question: {question}\nContext: {json.dumps(context)}")
            response = response_result.final_output

        return {"answer": response}
    except Exception as e:
        return {"error": str(e)}

# Run the FastAPI app
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)