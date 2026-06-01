(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  for (let i = 0; i < 20; i++) {
    try {
      const h = await fetch('http://localhost:3001/api/v1/health');
      if (h.ok) {
        console.log('health ok');
        break;
      }
    } catch (e) {
      // ignore
    }
    await wait(1000);
  }

  const res = await fetch('http://localhost:3001/api/v1/evaluations', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      ai_output: 'Test output from smoke test',
      user_intent: 'Summarize key findings',
      stakes_level: 3,
      domain: 'research',
      mode: 'quick',
    }),
  });

  const json = await res.json();
  console.log('create response:', JSON.stringify(json, null, 2));

  const evalId = json.evaluation_id;
  if (!evalId) {
    console.error('no evaluation id');
    process.exit(1);
  }

  const getEval = await fetch(`http://localhost:3001/api/v1/evaluations/${evalId}`);
  console.log('get evaluation:', JSON.stringify(await getEval.json(), null, 2));

  const traceId = json.trace_ids && json.trace_ids[0];
  if (traceId) {
    const t = await fetch(`http://localhost:3001/api/v1/traces/${traceId}`);
    console.log('trace:', JSON.stringify(await t.json(), null, 2));
  }

  const verdictRes = await fetch(`http://localhost:3001/api/v1/evaluations/${evalId}/verdict`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      trust_level: 'medium',
      action: 'use',
      rationale: 'This looks acceptable for a draft and references look plausible.',
    }),
  });

  console.log('verdict response:', JSON.stringify(await verdictRes.json(), null, 2));

  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
