import os
import requests
import streamlit as st

# Simple Streamlit monitoring/admin wrapper for the backend API

raw_api_base = os.environ.get(
    "SERVER_API_URL",
    "https://nl-claude-8hkkavsygpqkn5z24r9fvu.streamlit.app"
)
api_base = raw_api_base.rstrip('/')
if not api_base.endswith('/api/v1'):
    api_base = f"{api_base}/api/v1"

API_BASE = api_base

st.set_page_config(page_title="Calibrate — Backend Monitor", layout="centered")

st.title("Calibrate — Backend Monitor")
st.write("This lightweight Streamlit app performs health checks and exposes basic info about the backend API.")
st.markdown("**Resolved API base:**")
st.code(API_BASE)


def render_response(resp):
    content_type = resp.headers.get("Content-Type", "")
    if "application/json" in content_type:
        try:
            st.json(resp.json())
            return
        except ValueError:
            pass
    st.text(resp.text or "<no body>")


if st.button("Check API health"):
    try:
        resp = requests.get(f"{API_BASE}/health", timeout=10)
        resp.raise_for_status()
        st.success("API reachable")
        render_response(resp)
    except requests.exceptions.HTTPError as http_err:
        st.error(f"HTTP error: {http_err}")
        if http_err.response is not None:
            st.code(f"Status: {http_err.response.status_code}\n{http_err.response.text}")
    except requests.exceptions.RequestException as err:
        st.error(f"Request error: {err}")
    except Exception as err:
        st.error(f"Unexpected error: {err}")

st.markdown("---")
st.header("Manual endpoints")
health_url = st.text_input("Health endpoint", value=f"{API_BASE}/health")
if st.button("Fetch health URL"):
    try:
        r = requests.get(health_url, timeout=10)
        r.raise_for_status()
        render_response(r)
    except requests.exceptions.HTTPError as http_err:
        st.error(f"HTTP error: {http_err}")
        if http_err.response is not None:
            st.code(f"Status: {http_err.response.status_code}\n{http_err.response.text}")
    except requests.exceptions.RequestException as err:
        st.error(f"Request error: {err}")
    except Exception as err:
        st.error(f"Unexpected error: {err}")

st.markdown("---")
st.caption("Set `SERVER_API_URL` environment variable to point this app at your deployed API host.")
