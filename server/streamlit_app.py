import json
import os
from datetime import datetime

import google.generativeai as genai
import streamlit as st

MODEL = "gemini-2.5-flash"
DIMENSION_INSTRUCTIONS = {
    "correctness": "Extract the strongest claims and note any claim that is unsupported, inaccurate, or misleading relative to the user intent.",
    "completeness": "Identify what is missing for this output to satisfy the user intent and the stated stakes.",
    "reasoning": "Analyze the output reasoning flow and summarize logical strengths, weak links, or leap-of-faith steps.",
    "usefulness": "Assess whether the output is actionable and aligned with the user intent given the stakes.",
    "uncertainty": "List specific uncertainties, assumptions, open questions, or areas where the output appears overconfident.",
}

st.set_page_config(page_title="Calibrate — Gemini Evaluation", layout="wide")

st.title("Calibrate — Gemini Evaluation")
st.write(
    "Evaluate AI-generated output directly with Google Gemini 2.5 Flash. This app uses Gemini only and does not fall back to dummy content."
)


def get_api_key():
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        key = st.secrets.get("GEMINI_API_KEY") if "GEMINI_API_KEY" in st.secrets else None
    if not key:
        st.error(
            "Gemini API key not configured. Add GEMINI_API_KEY to Streamlit Secrets or environment variables."
        )
        st.stop()
    return key


def init_gemini():
    genai.configure(api_key=get_api_key())


def build_prompt(dimension: str, context: dict) -> str:
    return f"""You are an assistive evaluation engine for Calibrate. Do NOT provide a single trust score, verdict, or recommendation. Return only valid JSON.

Task: {DIMENSION_INSTRUCTIONS[dimension]}

User intent: {context['user_intent']}
Stakes: {context['stakes_level']}
Domain: {context['domain']}
Mode: {context['mode']}

AI output:
{context['ai_output']}

Return JSON with the following shape for {dimension}:
{get_expected_response_shape(dimension)}
"""


def get_expected_response_shape(dimension: str) -> str:
    return {
        "correctness": '{"claims": ["string"], "warnings": ["string"]}',
        "completeness": '{"gaps": ["string"], "risks": ["string"]}',
        "reasoning": '{"steps": ["string"], "weaknesses": ["string"]}',
        "usefulness": '{"alignment": "high|medium|low", "rationale": "string"}',
        "uncertainty": '{"items": ["string"]}',
    }[dimension]


def parse_json_response(raw: str) -> dict:
    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("Unable to find JSON object in model response")
    candidate = raw[start : end + 1]
    return json.loads(candidate)


def generate_text(prompt: str) -> str:
    init_gemini()
    if hasattr(genai, "GenerativeModel"):
        model = genai.GenerativeModel(MODEL)
        if hasattr(model, "generate_content"):
            response = model.generate_content(prompt)
        elif hasattr(model, "generate_text"):
            response = model.generate_text(prompt)
        elif hasattr(model, "predict"):
            response = model.predict(prompt)
        else:
            raise RuntimeError("Unsupported Gemini model API: no generate_content, generate_text or predict method")
    elif hasattr(genai, "get_model"):
        model = genai.get_model(MODEL)
        if hasattr(model, "generate_content"):
            response = model.generate_content(prompt=prompt)
        elif hasattr(model, "generate_text"):
            response = model.generate_text(prompt=prompt)
        elif hasattr(model, "predict"):
            response = model.predict(prompt=prompt)
        else:
            raise RuntimeError("Unsupported Gemini model API: no generate_content, generate_text or predict method")
    else:
        raise RuntimeError("Unsupported google.generativeai package API; please upgrade the package")

    if isinstance(response, dict):
        return response.get("text", json.dumps(response))
    return getattr(response, "text", str(response))


def evaluate_dimension(dimension: str, context: dict) -> dict:
    prompt = build_prompt(dimension, context)
    raw = generate_text(prompt)
    payload = parse_json_response(raw)
    return {"dimension": dimension, "trace": prompt, "raw": raw, "payload": payload}


def run_evaluation(context: dict) -> dict:
    results = [evaluate_dimension(d, context) for d in DIMENSION_INSTRUCTIONS.keys()]
    return {
        "evaluation_id": os.urandom(16).hex(),
        "model": MODEL,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "dimensions": {result["dimension"]: result for result in results},
    }


with st.form("evaluation_form"):
    user_intent = st.text_input(
        "Your goal",
        placeholder="Summarize key findings for a research memo",
        help="Explain what the AI output should accomplish.",
    )
    stakes = st.slider("Stakes", 1, 5, 3)
    domain = st.selectbox("Domain", ["general", "research", "writing", "career"])
    mode = st.selectbox("Mode", ["quick", "deep"])
    ai_output = st.text_area(
        "AI output",
        height=240,
        placeholder="Paste the AI-generated text here...",
    )
    submitted = st.form_submit_button("Run Gemini evaluation")

if submitted:
    if not user_intent or not ai_output:
        st.error("Both user intent and AI output are required.")
    else:
        context = {
            "ai_output": ai_output,
            "user_intent": user_intent,
            "stakes_level": stakes,
            "domain": domain,
            "mode": mode,
        }
        with st.spinner("Evaluating with Gemini..."):
            try:
                evaluation = run_evaluation(context)
                st.success("Evaluation complete")
                for dimension, result in evaluation["dimensions"].items():
                    st.subheader(dimension.capitalize())
                    st.markdown("**Payload**")
                    st.json(result["payload"])
                    with st.expander("Show raw prompt and response"):
                        st.markdown("**Prompt**")
                        st.code(result["trace"])
                        st.markdown("**Raw response**")
                        st.code(result["raw"])
            except Exception as err:
                st.error(f"Gemini evaluation failed: {err}")

st.markdown("---")
st.caption("This app evaluates AI output directly with Gemini 2.5 Flash. No fallback mode is enabled.")
