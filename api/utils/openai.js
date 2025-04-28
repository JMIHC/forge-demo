import { AzureOpenAI } from "openai";

// Initialize the Azure OpenAI client
function getClient() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_KEY;

  if (!endpoint || !apiKey) {
    throw new Error(
      "Azure OpenAI credentials not configured. Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY environment variables."
    );
  }

  return new AzureOpenAI({
    apiKey: apiKey,
    azure_endpoint: endpoint,
    api_version: "2024-12-01-preview", // Latest stable version
  });
}

const deploymentName = process.env.AZURE_OPENAI_MODEL_DEPLOYMENT || "gpt-4o";

export { getClient, deploymentName };
