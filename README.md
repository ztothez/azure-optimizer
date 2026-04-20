# Azure Optimizer
Azure Optimizer is a small multi-agent system that inspects infrastructure-as-code and workload signals, then synthesizes a single narrative report of drift, waste, and concrete improvements. A supervisor coordinates specialized agents: one reasons over Terraform to spot missing guardrails (for example cost alerts and backup coverage), another derives findings from operational metrics (cost and utilization). The supervisor aggregates those structured findings and uses a large language model to turn them into an actionable audit-style write-up—demonstrating agentic orchestration and reasoning over structured, enterprise-shaped inputs.

## Why it exists and how it works
Manual reviews of Azure estates rarely keep pace with configuration drift and creeping cost. This project demonstrates a pattern where **deterministic agents** produce **structured findings** from repo-local artifacts, and a **supervisor agent** merges and interprets them for humans.

Flow:
1. **Configuration agent** reads `config/infrastructure.tf` and flags gaps (e.g. missing metric alerts or backup-related resources) as a dictionary of findings.
2. **Metrics agent** loads `data/metrics.json`, normalizes usage vs. assumed capacity, and applies threshold rules (cost, CPU, memory, disk, network) to emit another findings dictionary.
3. **Supervision agent** collects both payloads, calls the Anthropic API (Claude), and returns a single markdown-friendly report with architectural and operational recommendations.

The **Streamlit** UI triggers that pipeline and streams status text plus the final report when you run an audit.

## Technologies used
- **Python 3** (3.12+ recommended)
- **Streamlit** — local web UI (`ui/ui.py`)
- **Anthropic API** — Claude for the supervision / synthesis step (`anthropic` SDK)
- **python-dotenv** — load `ANTHROPIC_API_KEY` from `.env`
- **Terraform (sample)** — `config/infrastructure.tf` as the configuration surface the config agent analyzes
- **JSON metrics** — `data/metrics.json` as a stand-in for time-series / billing aggregates

## How to run it locally
1. **Clone or open** the project and create a virtual environment:

   ```bash
   cd azure-optimizer
   python3 -m venv .venv
   source .venv/bin/activate   # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure the API key** — create a `.env` file in the project root:
   ```bash
   ANTHROPIC_API_KEY=your_key_here
   ```
   
3. **Start the app** from the project root (so imports resolve):
   ```bash
   streamlit run ui/ui.py
   ```
4. In the browser, open the URL Streamlit prints (typically `http://localhost:8501`) and click **Run Audit** to execute the full agent pipeline and view the generated report.

Ensure `config/infrastructure.tf` and `data/metrics.json` exist and match the paths used by the agents if you customize the layout.
