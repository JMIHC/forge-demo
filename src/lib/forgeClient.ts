// src/lib/forgeClient.ts
const BASE = import.meta.env.VITE_FUNC_URL;

export async function getSpec(prompt: string) {
  const r = await fetch(`${BASE}/spec`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description: prompt })
  });
  return r.json();                               // validated by structured-output JSON Schema  [oai_citation:2‡Microsoft Learn](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/structured-outputs?utm_source=chatgpt.com)
}

export async function getComponent(template: string, spec: object, model = "gpt-4o") {
  const r = await fetch(`${BASE}/forge?model=${model}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ template, spec })
  });
  return r.json();                               // streamed SSE works too  [oai_citation:3‡OpenAI Platform](https://platform.openai.com/docs/api-reference/streaming?utm_source=chatgpt.com)
}