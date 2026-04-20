import json
from pathlib import Path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
METRICS_PATH = PROJECT_ROOT / "data" / "metrics.json"

def metric_agent(input_data) -> dict:
    with open(METRICS_PATH, 'r') as file:
        metrics = json.load(file)
        data = metrics["data"]

    calculate_metrics = {
        'cpuUsage': data['cpuUsage']['series'][0]['value'],
        'memoryUsage': data['memoryUsage']['series'][0]['value'],
        'diskUsage': data['diskUsage']['series'][0]['value'],
        'networkBandwidth': data['networkBandwidth']['series'][0]['value']
    }

    percentages = {
        'cpuUsage': (calculate_metrics['cpuUsage'] / 8) * 100,
        'memoryUsage': (calculate_metrics['memoryUsage'] / 16) * 100,
        'diskUsage': (calculate_metrics['diskUsage'] / 2500) * 100,
        'networkBandwidth': (calculate_metrics['networkBandwidth'] / 100) * 100
    }

    # Analyze the metrics and generate findings
    findings = {}
    if data['monthlyCost']['amount'] > 500:
        findings['cost'] = 'High monthly cost detected'
    if percentages["memoryUsage"] > 80:
        findings['memory'] = 'High memory usage detected'
    if percentages["cpuUsage"] < 30:
        findings['cpu'] = 'Low CPU usage detected'
    if percentages["diskUsage"] < 40:
        findings['disk'] = 'Low disk usage detected'
    if percentages["networkBandwidth"] < 60:
        findings['network'] = 'Low network bandwidth usage detected'

    return findings