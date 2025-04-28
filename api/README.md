# Forge API - Azure Functions

This Azure Functions app serves as a secure proxy for Azure OpenAI calls. It provides the backend for the Forge component generation UI.

## Configuration

1. Update `local.settings.json` with your Azure OpenAI credentials:

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "",
    "AZURE_OPENAI_KEY": "your-azure-openai-key",
    "AZURE_OPENAI_ENDPOINT": "https://your-resource-name.openai.azure.com/",
    "AZURE_OPENAI_MODEL_DEPLOYMENT": "your-model-deployment-name"
  }
}
```

2. Create matching environment variables in the Azure Function App when deployed.

## Local Development

Run the Functions app locally:

```bash
cd api
npm start
```

The API will be available at http://localhost:7071/api/

## Deployment

Deploy to Azure using Azure Functions Core Tools:

```bash
cd api
func azure functionapp publish YOUR-FUNCTION-APP-NAME --build remote
```

After deployment, update your frontend app's environment variable:

```
VITE_FUNC_URL=https://your-function-app-name.azurewebsites.net/api
```

## API Endpoints

1. `/api/spec` - POST

   - Generates a component specification from a description
   - Expects: `{ "description": "string" }`
   - Returns: JSON specification

2. `/api/forge` - POST
   - Generates component code from a template and specification
   - Expects: `{ "template": "string", "spec": object }`
   - Optional query param: `?model=your-model-name`
   - Returns: JSON object with generated file(s)
