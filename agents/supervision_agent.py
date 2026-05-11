import json
import os
import time
import anthropic

# 1. FIXED IMPORTS: Using the actual function names from your files
from agents.metric_agent import metric_agent
from agents.config_agent import analyze_config

def supervise():
    yield "Analyzing metric findings..."
    
    # 2. FIXED FUNCTION CALL: metric_agent expects 'input_data', so we pass None
    metrics = metric_agent(None) 
    time.sleep(1) # Slight delay for UI effect

    yield "Analyzing configuration findings..."
    
    # 3. FIXED FUNCTION CALL: Calling analyze_config()
    config = analyze_config()
    time.sleep(1) # Slight delay for UI effect

    # Check if we have an API key configured
    api_key = os.getenv("ANTHROPIC_API_KEY")

    if api_key:
        yield "Generating report with Claude..."
        try:
            client = anthropic.Anthropic(api_key=api_key)
            prompt = f"Analyze these metrics and configs and generate a cost optimization report for Azure.\nMetrics: {json.dumps(metrics)}\nConfig: {config}"
            
            response = client.messages.create(
                model="claude-3-5-sonnet-latest",
                max_tokens=1000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            yield response.content[0].text
        except Exception as e:
            yield f"Error calling Claude: {str(e)}"
    else:
        # Fallback Demo Mode (No API Key needed)
        yield "Demo Mode: Compiling simulated report..."
        time.sleep(2) # Simulate AI thinking time
        
        mock_report = """## 🚀 Azure Cost Optimization Report (Demo Mode)

Based on the analysis of your `infrastructure.tf` and `metrics.json`, here are your actionable recommendations:

### 1. Compute Optimization
* **Finding:** Virtual Machine `vm-frontend-prod` is underutilized (Average CPU: 14% over 30 days).
* **Recommendation:** Downsize the instance from `Standard_D4s_v3` to `Standard_D2s_v3`.
* **Estimated Savings:** **$73.00 / month**

### 2. Storage Cleanup
* **Finding:** Identified 2 unattached Premium SSD Managed Disks (`disk-backup-old`, `disk-temp-01`).
* **Recommendation:** Delete unattached storage resources.
* **Estimated Savings:** **$38.40 / month**

### 3. Commitment Plans
* **Finding:** Database `sql-main-db` has been running 24/7 on Pay-As-You-Go pricing for 6+ months.
* **Recommendation:** Purchase a 1-year Reserved Instance.
* **Estimated Savings:** **~32% ($110.00 / month)**

---
**Total Potential Savings: ~$221.40 / month**

*(Note: This is a simulated demo report. Add an `ANTHROPIC_API_KEY` to your Hugging Face Space secrets to generate live AI reports!)*
"""
        yield mock_report