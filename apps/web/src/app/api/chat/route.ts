
// Allow responses up to 30 seconds
import { mastra } from "@repo/ai/server";
export const maxDuration = 30;

export async function POST(req: Request) {
  // Extract userAddress and chatId from search params
  const url = new URL(req.url);
  const userAddressFromParams = url.searchParams.get('userAddress');
  const chatIdFromParams = url.searchParams.get('chatId');

  // Extract the messages from the request body
  const { messages } = await req.json();
  console.log("this is the messages that are being sent", { messages })

  // Use userAddress and chatId from params
  const userAddress = userAddressFromParams;
  const chatId = chatIdFromParams;

  if (!userAddress) {
    return Response.json({ error: 'userAddress is required' }, { status: 400 });
  }

  if (!chatId) {
    return Response.json({ error: 'chatId is required' }, { status: 400 });
  }

  //TODO WOULD ADD PROPER AUTHENTICATION USING SIWE
  // Get the cortiGPT agent instance from Mastra
  const agent = mastra.getAgent("cortiGPTAgent");

  // Extract the last user message from the messages array
  const lastMessage = messages[messages.length - 1];

  if (!lastMessage || lastMessage.role !== 'user') {
    return Response.json({ error: 'No user message found' }, { status: 400 });
  }

  // Generate the response using the agent WITH memory context
  // chatId is used as threadId and userAddress as resource for memory management
  const result = await agent.generate([lastMessage], {
    memory: {
      thread: chatId, // Use chatId as threadId for conversation memory
      resource: userAddress // Use userAddress as resource identifier
    }
  });

  console.log("this is the result that is being returned", { result })

  // Return the result in UIMessage format that assistant-ui expects
  const response = {
    id: `msg-${Date.now()}`,
    role: 'assistant' as const,
    content: [{
      type: 'text' as const,
      text: result.text
    }]
  };

  return Response.json(response);
}