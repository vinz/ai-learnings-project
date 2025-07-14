from openai import AsyncAzureOpenAI
from agents import set_default_openai_client
from dotenv import load_dotenv
import os
from agents import Agent, HandoffInputData, Runner, function_tool, handoff, trace, set_default_openai_client, set_tracing_disabled, OpenAIChatCompletionsModel, set_tracing_export_api_key, add_trace_processor
import asyncio
import json


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

    # print credentials
    # print(f"API Key: {os.getenv('AZURE_OPENAI_API_KEY')}")
    # print(f"API Version: {os.getenv('AZURE_OPENAI_API_VERSION')}")
    # print(f"Azure Endpoint: {os.getenv('AZURE_OPENAI_ENDPOINT')}")
    # print(f"Azure Deployment: {os.getenv('AZURE_OPENAI_DEPLOYMENT')}")

    # Set the default OpenAI client for the Agents SDK
    set_default_openai_client(openai_client)
    set_tracing_export_api_key(os.getenv("OPENAI_API_KEY",""))

    set_tracing_disabled(False)

    # joke_agent = Agent(
    #     name="Joke Assistant",
    #     instructions="You are a funny joke teller.",
    #     model=OpenAIChatCompletionsModel(
    #         model="gpt-4.1",
    #         openai_client=openai_client
    #     ),
    # )
    # # Trace the entire run as a single workflow
    # with trace(workflow_name="Demo"):
    #     result = await Runner.run(joke_agent, input="Tell me a joke.")
    #     print(f"\nResponse: {result.final_output}\n")


# AI Learning Workflow
async def ai_learning_workflow():
    global openai_client
    print("Starting AI Learning Workflow...")
    
    # Load AI terms from aiTerms.json
    with open("aiTerms.json", "r") as file:
        ai_terms = json.load(file)

    topic_selector_agent = Agent(
        name="AITopicSelectorAgent",
        instructions="""
        You are an AI Engineer who loves teaching Non AI engineers.
        Select a random AI topic for learning from the provided list, focusing on areas suitable for beginner and intermediate AI engineers or non AI Engineers but aspiring to become one.

        You will select topics that are relevant to current trends in AI and machine learning, ensuring a diverse range of subjects.

        Your goal is to help software engineers expand their knowledge in AI by providing interesting and educational topics.

        Expected output: A single AI topic that is relevant and interesting for software engineers. Don't provide explanations or details about the topic at this stage; just the topic itself.

        The topic should be concise and clear, suitable for further exploration and learning.

        """,
        model=OpenAIChatCompletionsModel(
            model="gpt-4.1",
            openai_client=openai_client
        )
    )

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

    with trace(workflow_name="AI Learning Workflow"):
        topic_result = await Runner.run(topic_selector_agent, input=f"Select a topic from this list: {json.dumps(ai_terms)}")
        topic = topic_result.final_output

        description_result = await Runner.run(description_generator_agent, input=f"Generate descriptions for the topic: {topic}")
        descriptions = description_result.final_output

        insights_result = await Runner.run(insights_agent, input=f"Provide intriguing or mind-blowing facts about the topic: {topic}")
        insights = insights_result.final_output

        print(f"\nSelected Topic: {topic}\n")
        print(f"\nDescriptions: {descriptions}\n")
        print(f"\nInsights: {insights}\n")





async def main():
    print("=====START MAIN====")
    await init_openai()
    await ai_learning_workflow()

if __name__ == "__main__":
    asyncio.run(main())
