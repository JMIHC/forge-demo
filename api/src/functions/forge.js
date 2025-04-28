import { app } from "@azure/functions";
import { getClient, deploymentName } from "../../utils/openai.js";

app.http("forge", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      context.log("Processing component generation request");

      // Get the model parameter from query string or use default
      const model = request.query.get("model") || deploymentName;

      // Parse the request body
      const requestBody = await request.json();
      const { template, spec } = requestBody;

      if (!template || !spec) {
        return {
          status: 400,
          body: JSON.stringify({
            error: "Missing template or spec in request body",
          }),
          headers: { "Content-Type": "application/json" },
        };
      }

      const client = getClient();

      // Prepare the prompt for generating the component
      const prompt = `
I need you to generate a React component according to this template:

${template}

Using this specification:
${JSON.stringify(spec, null, 2)}

Return the generated component code as a JSON object with filenames as keys and content as values.
`;

      // Send the request to Azure OpenAI using the new API
      const response = await client.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are an expert React component generator.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 4000,
      });

      // Extract the response
      const componentResponse = response.choices[0]?.message?.content || "{}";

      // Try to parse the response as JSON - if it's not JSON, create a response with a single file
      let files;
      try {
        files = JSON.parse(componentResponse);
        // If the response is an object but not in the expected format (keys as filenames), wrap it
        if (typeof files !== "object" || Array.isArray(files)) {
          files = { "Component.tsx": componentResponse };
        }
      } catch (e) {
        // If parsing fails, assume the response is the raw component code
        files = { "Component.tsx": componentResponse };
      }

      return {
        status: 200,
        body: JSON.stringify(files),
        headers: { "Content-Type": "application/json" },
      };
    } catch (error) {
      context.error("Error in forge function:", error);
      return {
        status: 500,
        body: JSON.stringify({
          error: "Internal server error",
          message: error.message,
        }),
        headers: { "Content-Type": "application/json" },
      };
    }
  },
});
