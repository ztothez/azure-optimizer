import time
from agents.config_agent import analyze_config
from agents.metric_agent import metric_agent
import anthropic
import json
import os
from dotenv import load_dotenv
load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

def supervise():
    config_findings = analyze_config("./config/infrastructure.tf")
    time.sleep(0.5)
    yield "Analyzing configuration findings..."
    metric_findings = metric_agent({})
    time.sleep(0.5)
    yield "Analyzing metric findings..."

    combined = {
        "config_findings": config_findings,
        "metric_findings": metric_findings
    }

    client = anthropic.Anthropic()
    
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=2000,
        system="You are a supervision agent. Your task is to analyze the findings from the metric and configuration agents and provide insights and recommendations for improving the infrastructure.",
        messages=[
            {"role": "user", "content": "Do analysis on the architectural design and performance of the infrastructure and provide recommendations for improvement:" + json.dumps(combined)}
        ]
    )
    
    yield response.content[0].text