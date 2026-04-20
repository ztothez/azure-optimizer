import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import streamlit as st
from agents.supervision_agent import supervise

st.title('Azure Optimizer UI')
st.write('Welcome to the Azure Optimizer! This tool helps you optimize your Azure resources and save costs. Please select an option from the sidebar to get started.')

if st.button("Run Audit"):
    status = st.empty()
    report_placeholder = st.empty()
    
    for update in supervise():
        if "Analyzing" in update:
            status.text(update)
        else:
            status.text("Generating report...")
            report_placeholder.markdown(update)