import { app } from "@azure/functions";
import { getClient, deploymentName } from "../../utils/openai.js";

app.http("spec", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      context.log("Processing spec generation request");

      // Parse the request body
      const requestBody = await request.json();
      const { description } = requestBody;

      if (!description) {
        return {
          status: 400,
          body: JSON.stringify({
            error: "Missing description in request body",
          }),
          headers: { "Content-Type": "application/json" },
        };
      }

      const client = getClient();

      // Define the system message that instructs GPT to produce structured component specs
      const systemMessage = `You are a UI component specification generator. 
Convert the user's description into a structured specification for a React component.
Return valid JSON with these properties based on the context:
{
  "component": string, // Type of component to generate (table, form, chart, etc.)
  "name": string,      // Name for the component
  "theme": string,     // Visual theme ("outline", "solid", etc.)
  ... other properties specific to the component type
}`;

      // Send the request to Azure OpenAI using the updated API
      const response = await client.chat.completions.create({
        model: deploymentName,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: description },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      // Extract and parse the JSON response
      const jsonResponse = response.choices[0]?.message?.content || "{}";
      const parsedResponse = JSON.parse(jsonResponse);

      return {
        status: 200,
        body: JSON.stringify(parsedResponse),
        headers: { "Content-Type": "application/json" },
      };
    } catch (error) {
      context.error("Error in spec function:", error);
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
