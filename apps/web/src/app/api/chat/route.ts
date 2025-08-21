
// Allow responses up to 30 seconds
import { mastra } from "@repo/ai/server";
export const maxDuration = 30;

export async function POST(req: Request) {
  // Extract the messages and userAddress from the request body
  const { messages, userAddress } = await req.json();

  // Generate sessionId and threadId based on userAddress
  const sessionId = `session_${userAddress}`;
  const threadId = `thread_${userAddress}`;

  // Get the cortGPT agent instance from Mastra
  const agent = mastra.getAgent("cortGPTAgent");

  // Generate the response using the agent with sessionId and threadId
  const result = await agent.generate(messages, {
    sessionId,
    
    threadId
  });

  // Return the result as JSON response
  return Response.json({ message: result.text });
}