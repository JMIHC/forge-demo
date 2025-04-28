// src/lib/forgeClient.ts
// Azure Function Endpoint - this should be your Function App URL
const BASE = import.meta.env.VITE_FUNC_URL || "http://localhost:7071/api";

/**
 * Gets a specification based on the supplied prompt.
 */
export async function getSpec(prompt: string) {
  try {
    const r = await fetch(`${BASE}/spec`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: prompt })
    });
    
    if (!r.ok) {
      const errorText = await r.text();
      console.error("Failed to get spec:", errorText);
      throw new Error(`Failed to get spec: ${r.status} ${r.statusText}`);
    }
    
    return r.json();
  } catch (error) {
    console.error("Error in getSpec:", error);
    
    // Fallback to mock response if we can't connect to the Azure Function
    console.warn("Using fallback mock spec response");
    return {
      component: "table",
      name: "Example",
      theme: "outline",
      columns: [
        { id: "name", header: "Name", sortable: true },
        { id: "email", header: "Email", sortable: true }
      ],
      pagination: true
    };
  }
}

/**
 * Generates component code based on the template and spec.
 */
export async function getComponent(template: string, spec: Record<string, unknown>, model = "gpt-4o") {
  try {
    const r = await fetch(`${BASE}/forge?model=${model}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template, spec })
    });
    
    if (!r.ok) {
      const errorText = await r.text();
      console.error("Failed to generate component:", errorText);
      throw new Error(`Failed to generate component: ${r.status} ${r.statusText}`);
    }
    
    return r.json();
  } catch (error) {
    console.error("Error in getComponent:", error);
    
    // Fallback to mock response if we can't connect to the Azure Function
    console.warn("Using fallback mock component response");
    return {
      "Example.tsx": `// Generated component based on spec (Mock fallback)
import React from 'react';

export function Example() {
  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold">Generated Component</h2>
      <p>This is a placeholder for the actual generated component</p>
      <pre>${JSON.stringify(spec, null, 2)}</pre>
    </div>
  );
}`
    };
  }
}