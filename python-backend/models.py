import os
import json
from openai import AsyncAzureOpenAI
from agents import Agent, Runner, OpenAIChatCompletionsModel, set_default_openai_client, set_tracing_export_api_key, set_tracing_disabled
from dotenv import load_dotenv
from prompts import DESCRIPTION_GENERATOR_PROMPT, INSIGHTS_AGENT_PROMPT, QUESTION_ANSWER_AGENT_PROMPT, LINKEDIN_GENERATOR_PROMPT, QUIZ_PROMPT

# Load environment variables
load_dotenv()

def init_openai():
    openai_client = AsyncAzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT", ""),
        azure_deployment=os.getenv("AZURE_OPENAI_DEPLOYMENT")
    )
    set_default_openai_client(openai_client)
    set_tracing_export_api_key(os.getenv("OPENAI_API_KEY", ""))
    set_tracing_disabled(False)
    return openai_client

def load_ai_terms():
    with open("aiTerms.json", "r") as file:
        return json.load(file)

def get_onedayoneai_agents(openai_client):
    description_generator_agent = Agent(
        name="AIDescriptionGeneratorAgent",
        instructions=DESCRIPTION_GENERATOR_PROMPT,
        model=OpenAIChatCompletionsModel(
            model="gpt-4.1",
            openai_client=openai_client,
        )
    )
    insights_agent = Agent(
        name="AIInsightsAgent",
        instructions=INSIGHTS_AGENT_PROMPT,
        model=OpenAIChatCompletionsModel(
            model="gpt-4.1",
            openai_client=openai_client,
        )
    )
    question_answer_agent = Agent(
        name="AIQuestionAnswerAgent",
        instructions=QUESTION_ANSWER_AGENT_PROMPT,
        model=OpenAIChatCompletionsModel(
            model="gpt-4.1",
            openai_client=openai_client,
        )
    )

    quiz_agent = Agent(
        name="AIQuizAgent",
        instructions=QUIZ_PROMPT,
        model=OpenAIChatCompletionsModel(
            model="gpt-4.1",
            openai_client=openai_client,
        )
    )

    return description_generator_agent, insights_agent, question_answer_agent, quiz_agent

def get_linkedin_generator_agent(openai_client):
    linkedin_generator_agent = Agent(
        name="LinkedInGeneratorAgent",
        instructions=LINKEDIN_GENERATOR_PROMPT,
        model=OpenAIChatCompletionsModel(
            model="gpt-4.1",
            openai_client=openai_client,
        )
    )
    return linkedin_generator_agent