import pydantic

import os
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from db import models, repo
import seed


router = APIRouter()

# Install the following dependencies: azure.identity and azure-ai-inference

endpoint = os.getenv("AZURE_INFERENCE_SDK_ENDPOINT", "https://insightyhub6687426537.services.ai.azure.com/models")
model_name = os.getenv("DEPLOYMENT_NAME", "gpt-4o-mini")
key = os.getenv("AZURE_INFERENCE_SDK_KEY", "99D0iFYGle38S8qgyuHZ7SQaCU2f3i8Bl3VKBi3GIereRO0hBeF9JQQJ99BBACYeBjFXJ3w3AAAAACOG1VsP")
client = ChatCompletionsClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(key),
    
)

@router.post("/load")
def load_data():
    graphs = seed.load()
    return repo.bulk_create_graphs(graphs)


@router.get("/graphs")
def get_graphs() -> dict[str, list[models.Graph]]:
    return repo.get_graphs()

@router.get("/graph/{graph_id}")
def get_graph(graph_id: str) -> models.Graph:
    return repo.get_graph(graph_id)

class ChatRequest(pydantic.BaseModel):
    user_id: str
    action: str
    prompt: str
    graph_ids: list[str]

@router.post("/chat")
def chat(chatreq: ChatRequest):
    
    system_message = SystemMessage(content="""
        You are an assistant for a decision-maker in Qatar's National Planning Council, tasked with analyzing and responding to questions about multiple graph-based datasets related to various sectors such as traffic, energy, population, and more.

        When the user selects graphs and provides their context, you will use the data and the specified action attribute to address their questions. Be concise, insightful, and directly address the user's queries.

        # Action Attributes:

        - **Explain:** Provide descriptive analytics of the data.
        - **Reason:** Analyze causation and why trends or changes occurred.
        - **Predict:** Offer forecasts based on the data trends.
        - **Advise:** Provide prescriptive actions or recommendations based on insights.

        # Guidelines

        - Always tailor your response to the *action attribute* provided.
        - Reference the specific context and data presented in the graph when forming your responses.
        - Maintain clarity and professionalism while being concise.

        # Output Format

        - **Explain:** Provide a short and clear description of the data trends in the graph.
        - **Reason:** Discuss possible causes for the observed phenomena with evidence from the data.
        - **Predict:** Offer a brief yet data-backed prediction based on trends and patterns in the graph.
        - **Advise:** Provide actionable recommendations tailored to the insights derived from the graph.

        # Example Input and Output

        ### Input:

        Graph Data: "Traffic congestion increased by 12% in urban areas during the last quarter while suburban areas saw a 5% decrease. Peak hours show the highest spikes."  
        Action: Reason  

        ### Output:

        The increase in urban congestion could be due to higher workforce commuting patterns post-holiday season or limited capacity in urban infrastructure to handle peak loads. Conversely, suburban areas likely experienced reductions either due to remote work options or a shift in commuting preferences.

        ---

        ### Input:

        Graph Data: "Energy consumption grew by 15% in Q3 across residential areas, with a peak load during summer months (June-August)."  
        Action: Advise  

        ### Output:

        To manage increased energy demand, consider promoting energy-efficient appliances through subsidies and public awareness campaigns. Additionally, expanding renewable energy sources during peak demand periods could alleviate pressure on conventional energy grids.

        # Notes

        - When providing reasoning or advice, ensure that cultural, geographic, and policy-related factors relevant to Qatar are incorporated.
        - Avoid unnecessary elaboration or tangents; stick closely to the data and user's query.
        - If the input data lacks clarity, request additional details before forming conclusions.
    """)

    graphs = [repo.get_graph(i) for i in chatreq.graph_ids]

    graphs_data = [
        f"""
        Graph title: {g.title}
        Graph category: {g.category}
        Graph csv data: 
            {g.csv1}
            {g.csv2}
        Graph summary:
            {g.summary}
        """
        for g in graphs
    ]

    graphs_prompt = '\n'.join(graphs_data)
    graphs_prompt = f"Selected graphs data:\n{graphs_prompt}"

    action_prompt = f"Action: {chatreq.action}" if chatreq.action else ""
    user_message = UserMessage(content=f"""
        {action_prompt}

        {chatreq.prompt}

        {graphs_prompt if graphs else ""}
    """)
    
    response = client.complete(
        model=model_name,
        messages=[system_message, user_message],
    )

    return response.choices[0].message.content