import os
import requests
import streamlit as st

# Simple Streamlit monitoring/admin wrapper for the backend API

API_BASE = os.environ.get("SERVER_API_URL", "http://localhost:3001/api/v1")

st.set_page_config(page_title="Calibrate — Backend Monitor", layout="centered")

st.title("Calibrate — Backend Monitor")

st.write("This lightweight Streamlit app performs health checks and exposes basic info about the backend API.")

if st.button("Check API health"):
    try:
        resp = requests.get(f"{API_BASE}/health", timeout=5)
        resp.raise_for_status()
        data = resp.json()
        st.success("API reachable")
        st.json(data)
    except Exception as e:
        st.error(f"Failed to reach API: {e}")

st.markdown("---")
st.header("Manual endpoints")
health_url = st.text_input("Health endpoint", value=f"{API_BASE}/health")
if st.button("Fetch health URL"):
    try:
        r = requests.get(health_url, timeout=5)
        r.raise_for_status()
        st.json(r.json())
    except Exception as e:
        st.error(f"Error: {e}")

st.markdown("---")
st.caption("Set `SERVER_API_URL` environment variable to point this app at your deployed API host.")
