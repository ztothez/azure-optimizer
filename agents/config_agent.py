
from pathlib import Path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = PROJECT_ROOT / "config" / "infrastructure.tf"

def analyze_config(file_path: str = None) -> dict:
    if file_path is None:
        file_path = CONFIG_PATH

    with open(file_path, 'r') as file:
        config_data = file.read()

    findings = {}

    if "azurerm_monitor_metric_alert" not in config_data:
        findings["cost_alerts"] = "missing"
    if "azurerm_backup_policy_vm" not in config_data or "azurerm_backup_protected_vm" not in config_data or "azurerm_recovery_services_vault" not in config_data:
        findings["backup_alerts"] = "missing"
    return findings