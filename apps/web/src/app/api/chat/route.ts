
// Allow responses up to 30 seconds
import { mastra } from "@repo/ai/server";
export const maxDuration = 30;

export async function POST(req: Request) {
  // Extract the messages and userAddress from the request body
  const { messages, userAddress } = await req.json();
  //TODO WOULD ADD PROPER AUTHENTICATION USING SIWE 
  // Get the cortGPT agent instance from Mastra
  const agent = mastra.getAgent("cortGPTAgent");

  // Generate the response using the agent with memory configuration
  const result = await agent.generate(messages, {
    memory: {
      thread: `thread_${userAddress}`,
      resource: userAddress
    }
  });

  // Return the result as JSON response
  return Response.json({ message: result.text });
}