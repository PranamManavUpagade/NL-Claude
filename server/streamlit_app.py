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


def build_combined_prompt(context: dict) -> str:
    instructions_block = "\n".join([f"- {d.upper()}: {instr}" for d, instr in DIMENSION_INSTRUCTIONS.items()])
    expected_shapes = """{
  "correctness": {
    "claims": ["string"],
    "warnings": ["string"]
  },
  "completeness": {
    "gaps": ["string"],
    "risks": ["string"]
  },
  "reasoning": {
    "steps": ["string"],
    "weaknesses": ["string"]
  },
  "usefulness": {
    "alignment": "high|medium|low",
    "rationale": "string"
  },
  "uncertainty": {
    "items": ["string"]
  }
}"""
    return f"""You are an assistive evaluation engine for Calibrate. Do NOT provide a single trust score, verdict, or recommendation. Evaluate the AI output on all five dimensions listed below.
Return only valid JSON.

Dimensions to evaluate:
{instructions_block}

User intent: {context['user_intent']}
Stakes: {context['stakes_level']}
Domain: {context['domain']}
Mode: {context['mode']}

AI output:
{context['ai_output']}

Return a single JSON object with the following schema:
{expected_shapes}
"""


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


def run_evaluation(context: dict) -> dict:
    prompt = build_combined_prompt(context)
    raw = generate_text(prompt)
    payload = parse_json_response(raw)
    
    # Defaults in case the LLM misses any keys
    default_payloads = {
        "correctness": {"claims": [], "warnings": []},
        "completeness": {"gaps": [], "risks": []},
        "reasoning": {"steps": [], "weaknesses": []},
        "usefulness": {"alignment": "medium", "rationale": ""},
        "uncertainty": {"items": []}
    }
    
    results = {}
    for d in DIMENSION_INSTRUCTIONS.keys():
        # Get the dimension sub-object from payload, falling back to default
        dim_payload = payload.get(d, default_payloads[d])
        # Ensure it has the correct nested properties
        if d == "correctness":
            if not isinstance(dim_payload, dict): dim_payload = {}
            dim_payload = {
                "claims": dim_payload.get("claims", []),
                "warnings": dim_payload.get("warnings", [])
            }
        elif d == "completeness":
            if not isinstance(dim_payload, dict): dim_payload = {}
            dim_payload = {
                "gaps": dim_payload.get("gaps", []),
                "risks": dim_payload.get("risks", [])
            }
        elif d == "reasoning":
            if not isinstance(dim_payload, dict): dim_payload = {}
            dim_payload = {
                "steps": dim_payload.get("steps", []),
                "weaknesses": dim_payload.get("weaknesses", [])
            }
        elif d == "usefulness":
            if not isinstance(dim_payload, dict): dim_payload = {}
            dim_payload = {
                "alignment": dim_payload.get("alignment", "medium"),
                "rationale": dim_payload.get("rationale", "")
            }
        elif d == "uncertainty":
            if not isinstance(dim_payload, dict): dim_payload = {}
            dim_payload = {
                "items": dim_payload.get("items", [])
            }
            
        results[d] = {
            "dimension": d,
            "trace": prompt,
            "raw": raw,
            "payload": dim_payload
        }
        
    return {
        "evaluation_id": os.urandom(16).hex(),
        "model": MODEL,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "dimensions": results,
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
