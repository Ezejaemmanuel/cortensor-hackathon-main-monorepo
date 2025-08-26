/**
 * Cortensor API Transformers
 * 
 * This module handles the conversion between OpenAI format and Cortensor API format.
 * It provides utilities to transform requests and responses between the two formats,
 * enabling seamless integration with the Vercel AI SDK.
 */

import type { CoreMessage } from 'ai';
import type {
  CortensorModelConfig,
  WebSearchResult,
  WebSearchCallback,
  CortensorRequest,
  CortensorResponse,
  CortensorChoice,
  CortensorUsage,
  OpenAIRequest,
  OpenAIResponse,
  SearchDirectives,
  CortensorTransformResult
} from './types';
import { WebSearchError, ConfigurationError } from './provider';
import { DEFAULT_MODEL_CONFIG } from './constants';

// ============================================================================
// WEB SEARCH FUNCTIONALITY
// ============================================================================

/**
 * Extracts search directives from messages and cleans the content
 * @param messages - Array of conversation messages
 * @param webSearchConfig - Web search configuration
 * @returns Search directives and cleaned messages
 */
export function extractSearchDirectives(
  messages: CoreMessage[],
  webSearchConfig?: CortensorModelConfig['webSearch']
): SearchDirectives {
  console.log('🔍 [SEARCH] Extracting search directives from messages...');
  console.log('🔍 [SEARCH] Messages count:', messages.length);
  console.log('🔍 [SEARCH] Web search config present:', !!webSearchConfig);

  if (!webSearchConfig) {
    console.log('🔍 [SEARCH] No web search config, skipping search');
    return {
      shouldSearch: false,
      cleanedMessages: messages,
    };
  }

  if (messages.length === 0) {
    console.log('🔍 [SEARCH] No messages provided, skipping search');
    return {
      shouldSearch: false,
      cleanedMessages: messages,
    };
  }

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) {
    console.log('🔍 [SEARCH] Last message is undefined, skipping search');
    return {
      shouldSearch: false,
      cleanedMessages: messages,
    };
  }

  const originalContent = extractMessageContent(lastMessage);
  console.log('🔍 [SEARCH] Original message content length:', originalContent.length);
  let cleanedContent = originalContent;
  let shouldSearch = false;

  // Check for [**search**] marker
  const hasSearchMarker = /\[\*\*search\*\*\]/i.test(originalContent);
  // Check for [**no-search**] marker
  const hasNoSearchMarker = /\[\*\*no-search\*\*\]/i.test(originalContent);

  console.log('🔍 [SEARCH] Search markers found:', { hasSearchMarker, hasNoSearchMarker });
  console.log('🔍 [SEARCH] Web search mode:', webSearchConfig.mode);

  // Remove markers from content
  cleanedContent = cleanedContent.replace(/\[\*\*search\*\*\]/gi, '').replace(/\[\*\*no-search\*\*\]/gi, '').trim();
  console.log('🔍 [SEARCH] Content cleaned, new length:', cleanedContent.length);

  // Determine if search should be performed based on mode and markers
  if (webSearchConfig.mode === 'force') {
    shouldSearch = true;
    console.log('🔍 [SEARCH] Force mode enabled, will search');
  } else if (webSearchConfig.mode === 'disable') {
    shouldSearch = false;
    console.log('🔍 [SEARCH] Search disabled by mode');
  } else { // prompt-based mode
    if (hasNoSearchMarker) {
      shouldSearch = false;
      console.log('🔍 [SEARCH] No-search marker found, skipping search');
    } else if (hasSearchMarker) {
      shouldSearch = true;
      console.log('🔍 [SEARCH] Search marker found, will search');
    } else {
      shouldSearch = false; // Default to no search unless explicitly requested
      console.log('🔍 [SEARCH] No explicit markers, defaulting to no search');
    }
  }

  const cleanedMessages: CoreMessage[] = [
    ...messages.slice(0, -1),
    {
      ...lastMessage,
      content: cleanedContent as any
    }
  ];

  console.log('✅ [SEARCH] Search directives extracted:', { shouldSearch, cleanedMessagesCount: cleanedMessages.length });
  return {
    shouldSearch,
    cleanedMessages,
  };
}



/**
 * Generates a search query from conversation messages
 * @param messages - Array of conversation messages
 * @param cortensorConfig - Configuration for making API calls to Cortensor
 * @returns Promise resolving to search query string
 */
export async function generateSearchQuery(
  messages: CoreMessage[],
  cortensorConfig: { apiKey: string; baseUrl: string; sessionId: number }
): Promise<string> {
  console.log('🔍 [SEARCH-QUERY] Generating search query from messages...');
  console.log('🔍 [SEARCH-QUERY] Messages count:', messages.length);
  console.log('🔍 [SEARCH-QUERY] Session ID:', cortensorConfig.sessionId);

  if (messages.length === 0) {
    console.log('🔍 [SEARCH-QUERY] No messages provided, using default');
    return 'general information';
  }

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) {
    console.log('🔍 [SEARCH-QUERY] Last message is undefined, using default');
    return 'general information';
  }

  const userPrompt = extractMessageContent(lastMessage);
  console.log('🔍 [SEARCH-QUERY] User prompt length:', userPrompt.length);

  // Create a prompt to ask the model to generate a search query
  const searchQueryPrompt = `Convert the following user prompt into a concise web search query (maximum 10 words). Only return the search query, nothing else:\n\nUser prompt: ${userPrompt}`;
  console.log('🔍 [SEARCH-QUERY] Search query prompt created, length:', searchQueryPrompt.length);

  try {
    // Validate configuration
    if (!cortensorConfig.apiKey || !cortensorConfig.baseUrl) {
      console.error('❌ [SEARCH-QUERY] Missing API key or base URL');
      throw new ConfigurationError('API key and base URL are required for search query generation');
    }

    console.log('🌐 [SEARCH-QUERY] Making API call to generate search query...');
    const response = await fetch(`${cortensorConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cortensorConfig.apiKey}`
      },
      body: JSON.stringify({
        session_id: cortensorConfig.sessionId,
        prompt: searchQueryPrompt,
        max_tokens: 50,
        temperature: 0.1
      })
    });

    console.log('🌐 [SEARCH-QUERY] API response status:', response.status);
    if (!response.ok) {
      console.error('❌ [SEARCH-QUERY] API call failed:', response.status, response.statusText);
      throw new WebSearchError(`Failed to generate search query: API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const searchQuery = data.choices?.[0]?.text?.trim() || userPrompt;
    console.log('🔍 [SEARCH-QUERY] Generated search query:', searchQuery);

    console.log('✅ [SEARCH-QUERY] Search query generated successfully');
    return searchQuery;
  } catch (error) {
    if (error instanceof ConfigurationError || error instanceof WebSearchError) {
      console.error('❌ [SEARCH-QUERY] Configuration or web search error:', error.message);
      throw error; // Re-throw custom errors
    }
    console.warn('⚠️ [SEARCH-QUERY] Failed to generate search query via API, using original prompt:', error);
    console.log('🔄 [SEARCH-QUERY] Falling back to user prompt:', userPrompt);
    return userPrompt;
  }
}

/**
 * Formats search results as numbered citations with a sources section
 * @param results - Array of search results
 * @returns Formatted search results with numbered citations and sources section
 */
export function formatSearchResults(
  results: WebSearchResult[]
): string {
  console.log('📝 [FORMAT] Formatting search results...');
  console.log('📝 [FORMAT] Results to format:', results.length);

  if (results.length === 0) {
    console.log('📝 [FORMAT] No results to format, returning empty string');
    return '';
  }

  // Create the sources section
  const sources = results
    .map((result, index) => {
      console.log(`📝 [FORMAT] Formatting result ${index + 1}:`, {
        title: result.title?.substring(0, 30) + '...',
        hasUrl: !!result.url
      });
      return `[${index + 1}] [${result.title}](${result.url})`;
    })
    .join('\n');

  const formatted = `\n\n**Sources:**\n${sources}`;
  console.log('✅ [FORMAT] Search results formatted successfully, total length:', formatted.length);
  return formatted;
}

/**
 * Builds a prompt enhanced with search results
 * @param messages - Original conversation messages
 * @param searchResults - Web search results
 * @param searchQuery - The query used for searching
 * @returns Enhanced prompt string
 */
export function buildPromptWithSearchResults(
  messages: CoreMessage[],
  searchResults: WebSearchResult[],
  searchQuery: string
): string {
  console.log('🔨 [BUILD-PROMPT] Building prompt with search results...');
  console.log('🔨 [BUILD-PROMPT] Messages count:', messages.length);
  console.log('🔨 [BUILD-PROMPT] Search results count:', searchResults.length);
  console.log('🔨 [BUILD-PROMPT] Search query:', searchQuery);

  const systemMessages = messages.filter(msg => msg.role === 'system');
  const conversationMessages = messages.filter(msg => msg.role !== 'system');

  console.log('🔨 [BUILD-PROMPT] System messages:', systemMessages.length);
  console.log('🔨 [BUILD-PROMPT] Conversation messages:', conversationMessages.length);

  console.log('🔨 [BUILD-PROMPT] Building original prompt...');
  const originalPrompt = buildFormattedPrompt(systemMessages, conversationMessages);
  console.log('📝 [BUILD-PROMPT] Formatting search results...');
  const formattedResults = formatSearchResults(searchResults);

  const enhancedPrompt = `${originalPrompt}\n\n--- WEB SEARCH RESULTS ---\nSearch Query: "${searchQuery}"\n\n${formattedResults}\n\nPlease use the above search results to provide an accurate, up-to-date response. If the search results are relevant, incorporate the information into your answer. If they're not relevant, you can ignore them and provide a general response.`;

  console.log('✅ [BUILD-PROMPT] Prompt with search results built successfully, total length:', enhancedPrompt.length);
  return enhancedPrompt;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extracts text content from a message, handling both string and array formats
 * @param message - The message to extract content from
 * @returns The extracted text content
 */
function extractMessageContent(message: CoreMessage): string {
  if (typeof message.content === 'string') {
    return message.content;
  }

  if (Array.isArray(message.content)) {
    return message.content
      .filter(part => {
        // Handle string parts
        if (typeof part === 'string') return true;
        // Handle text objects
        if (typeof part === 'object' && part !== null && 'type' in part) {
          return part.type === 'text';
        }
        return false;
      })
      .map(part => {
        if (typeof part === 'string') {
          return part;
        }
        // Extract text from text objects
        return (part as any).text || '';
      })
      .join(' ')
      .trim();
  }

  return '';
}

/**
 * Builds a formatted prompt from system and conversation messages
 * @param systemMessages - Array of system messages
 * @param conversationMessages - Array of conversation messages
 * @returns Formatted prompt string
 */
function buildFormattedPrompt(systemMessages: CoreMessage[], conversationMessages: CoreMessage[]): string {
  let prompt = '';

  // Add system instructions section if present
  if (systemMessages.length > 0) {
    const systemInstructions = systemMessages
      .map(msg => extractMessageContent(msg))
      .join('\n\n');

    prompt += `### SYSTEM INSTRUCTIONS ###\n${systemInstructions}\n\n### CONVERSATION ###\n`;
  }

  // Add conversation history with role formatting
  const conversationText = conversationMessages
    .map(msg => {
      const content = extractMessageContent(msg);
      switch (msg.role) {
        case 'user':
          return `Human: ${content}`;
        case 'assistant':
          return `Assistant: ${content}`;
        default:
          return content;
      }
    })
    .join('\n\n');

  prompt += conversationText;

  // Add assistant prompt if the last message is from user
  const lastMessage = conversationMessages[conversationMessages.length - 1];
  if (conversationMessages.length > 0 && lastMessage?.role === 'user') {
    prompt += '\n\nAssistant:';
  }

  return prompt;
}

/**
 * Helper function to handle different web search callback types
 * @param query - The search query
 * @param provider - The web search provider (object or function)
 * @param maxResults - Maximum number of results to return
 * @returns Promise resolving to search results
 */
async function handleWebSearch(
  query: string,
  provider: WebSearchCallback,
  maxResults: number
): Promise<WebSearchResult[]> {
  console.log('🌐 [WEB-SEARCH] Starting web search...');
  console.log('🌐 [WEB-SEARCH] Query:', query);
  console.log('🌐 [WEB-SEARCH] Max results:', maxResults);
  console.log('🌐 [WEB-SEARCH] Provider type:', typeof provider);

  try {
    let results: WebSearchResult[];

    // Check if it's a provider object with search method or direct function
    if (typeof provider === 'function') {
      console.log('🌐 [WEB-SEARCH] Using function provider');
      results = await provider(query, maxResults);
    } else {
      console.log('🌐 [WEB-SEARCH] Using object provider with search method');
      results = await provider.search(query, maxResults);
    }

    console.log('✅ [WEB-SEARCH] Search completed successfully');
    console.log('✅ [WEB-SEARCH] Results count:', results.length);
    results.forEach((result, index) => {
      console.log(`✅ [WEB-SEARCH] Result ${index + 1}:`, {
        title: result.title?.substring(0, 50) + '...',
        url: result.url,
        snippetLength: result.snippet?.length || 0
      });
    });

    return results;
  } catch (error) {
    console.error('❌ [WEB-SEARCH] Search failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown web search error';
    throw new WebSearchError(`Web search failed: ${errorMessage}`);
  }
}

/**
 * Transforms OpenAI request format to Cortensor API format
 * @param requestBody - The OpenAI-formatted request body as string
 * @param sessionId - The session ID to include in the request
 * @param modelConfig - Optional model configuration to override defaults
 * @returns Cortensor transform result with request and optional web search data
 */
export async function transformToCortensor(
  requestBody: string,
  sessionId: number,
  modelConfig?: CortensorModelConfig
): Promise<CortensorTransformResult> {
  console.log('🔄 [TRANSFORM] Starting transformation to Cortensor format...');
  console.log('🔄 [TRANSFORM] Session ID:', sessionId);
  console.log('🔄 [TRANSFORM] Model config present:', !!modelConfig);

  try {
    const openAIRequest: OpenAIRequest = JSON.parse(requestBody);
    console.log('🔄 [TRANSFORM] Parsed OpenAI request, messages count:', openAIRequest.messages.length);

    // Extract search directives and clean messages
    console.log('🔍 [TRANSFORM] Extracting search directives...');
    const searchDirectives = extractSearchDirectives(openAIRequest.messages, modelConfig?.webSearch);
    let finalPrompt: string = '';
    let webSearchResults: WebSearchResult[] | undefined;
    let searchQuery: string | undefined;

    // Handle web search if needed
    if (searchDirectives.shouldSearch && modelConfig?.webSearch?.provider) {
      console.log('🌐 [TRANSFORM] Web search is required, starting search process...');
      try {
        // Generate search query using main Cortensor configuration
        console.log('🔍 [TRANSFORM] Generating search query...');
        searchQuery = await generateSearchQuery(
          searchDirectives.cleanedMessages,
          {
            apiKey: process.env.CORTENSOR_API_KEY || '',
            baseUrl: process.env.CORTENSOR_BASE_URL || '',
            sessionId: sessionId
          }
        );
        console.log('🔍 [TRANSFORM] Search query generated:', searchQuery);

        // Perform web search using flexible provider
        console.log('🌐 [TRANSFORM] Performing web search...');
        webSearchResults = await handleWebSearch(
          searchQuery,
          modelConfig.webSearch.provider,
          modelConfig.webSearch.maxResults ?? 5
        );
        console.log('🌐 [TRANSFORM] Web search completed, results:', webSearchResults.length);

        // Build enhanced prompt with search results
        console.log('🔨 [TRANSFORM] Building prompt with search results...');
        finalPrompt = buildPromptWithSearchResults(
          searchDirectives.cleanedMessages,
          webSearchResults,
          searchQuery
        );
        console.log('🔨 [TRANSFORM] Enhanced prompt built, length:', finalPrompt.length);
      } catch (error) {
        console.error('❌ [TRANSFORM] Error during web search process:', error);

        if (error instanceof ConfigurationError) {
          console.error('❌ [TRANSFORM] Configuration error, re-throwing:', error.message);
          throw error;
        }

        // Log web search errors but continue with fallback
        if (error instanceof WebSearchError) {
          console.warn('⚠️ [TRANSFORM] Web search failed, continuing without search results:', error.message);
        } else {
          console.warn('⚠️ [TRANSFORM] Unexpected error during web search:', error);
        }

        // Fall through to standard prompt building
        console.log('🔄 [TRANSFORM] Falling back to standard prompt building...');
      }
    } else {
      console.log('🔄 [TRANSFORM] No web search required or configured');
    }

    // Build standard prompt if no search or search failed
    if (!finalPrompt) {
      console.log('🔨 [TRANSFORM] Building standard prompt...');
      const systemMessages = searchDirectives.cleanedMessages.filter(msg => msg.role === 'system');
      const conversationMessages = searchDirectives.cleanedMessages.filter(msg => msg.role !== 'system');
      console.log('🔨 [TRANSFORM] System messages:', systemMessages.length, 'Conversation messages:', conversationMessages.length);
      finalPrompt = buildFormattedPrompt(systemMessages, conversationMessages);
      console.log('🔨 [TRANSFORM] Standard prompt built, length:', finalPrompt.length);
    }

    // Create Cortensor request with model config or defaults
    console.log('🔧 [TRANSFORM] Creating Cortensor request object...');
    const cortensorRequest: CortensorRequest = {
      session_id: sessionId,
      prompt: finalPrompt,
      prompt_type: modelConfig?.promptType ?? DEFAULT_MODEL_CONFIG.promptType,
      prompt_template: modelConfig?.promptTemplate ?? DEFAULT_MODEL_CONFIG.promptTemplate,
      stream: modelConfig?.stream ?? DEFAULT_MODEL_CONFIG.stream,
      timeout: modelConfig?.timeout ?? DEFAULT_MODEL_CONFIG.timeout,
      client_reference: `user-request-${Date.now()}`,
      max_tokens: modelConfig?.maxTokens ?? DEFAULT_MODEL_CONFIG.maxTokens,
      temperature: modelConfig?.temperature ?? openAIRequest.temperature ?? DEFAULT_MODEL_CONFIG.temperature,
      top_p: modelConfig?.topP ?? DEFAULT_MODEL_CONFIG.topP,
      top_k: modelConfig?.topK ?? DEFAULT_MODEL_CONFIG.topK,
      presence_penalty: modelConfig?.presencePenalty ?? DEFAULT_MODEL_CONFIG.presencePenalty,
      frequency_penalty: modelConfig?.frequencyPenalty ?? DEFAULT_MODEL_CONFIG.frequencyPenalty
    };

    console.log('🔧 [TRANSFORM] Cortensor request created with config:', {
      sessionId: cortensorRequest.session_id,
      promptLength: cortensorRequest.prompt.length,
      maxTokens: cortensorRequest.max_tokens,
      temperature: cortensorRequest.temperature
    });

    const result: CortensorTransformResult = {
      request: cortensorRequest
    };

    if (webSearchResults) {
      result.webSearchResults = webSearchResults;
      console.log('🔧 [TRANSFORM] Added web search results to transform result');
    }

    if (searchQuery) {
      result.searchQuery = searchQuery;
      console.log('🔧 [TRANSFORM] Added search query to transform result');
    }

    console.log('✅ [TRANSFORM] Transformation to Cortensor format completed successfully');
    return result;
  } catch (error) {
    console.error('❌ [TRANSFORM] Error transforming to Cortensor format:', error);
    console.error('❌ [TRANSFORM] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw new Error('Failed to transform request to Cortensor format');
  }
}

/**
 * Creates a standardized error response in OpenAI format
 * @param errorMessage - The error message to include
 * @returns OpenAI-formatted error response
 */
function createErrorResponse(errorMessage: string = 'Sorry, I encountered an error processing your request.'): OpenAIResponse {
  console.log('🚨 [ERROR-RESPONSE] Creating standardized error response...');
  console.log('🚨 [ERROR-RESPONSE] Error message:', errorMessage);

  const errorResponse = {
    id: `cortensor-error-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'cortensor-model',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant' as const,
          content: errorMessage
        },
        finish_reason: 'stop'
      }
    ]
  };

  console.log('🚨 [ERROR-RESPONSE] Error response created:', {
    id: errorResponse.id,
    contentLength: errorResponse?.choices[0]?.message.content.length
  });

  return errorResponse;
}


/**
 * Transforms Cortensor response to OpenAI format
 * @param cortensorResponse - The response from Cortensor API
 * @param webSearchResults - Optional web search results to include as tool calls
 * @param searchQuery - The search query used (if any)
 * @returns Promise<Response> - OpenAI-formatted response
 */
export async function transformToOpenAI(
  cortensorResponse: Response,
  webSearchResults?: WebSearchResult[],
  searchQuery?: string
): Promise<Response> {
  console.log('🔄 [TRANSFORM-BACK] Starting transformation to OpenAI format...');
  console.log('🔄 [TRANSFORM-BACK] Response status:', cortensorResponse.status);
  console.log('🔄 [TRANSFORM-BACK] Web search results count:', webSearchResults?.length || 0);
  console.log('🔄 [TRANSFORM-BACK] Search query present:', !!searchQuery);

  try {
    console.log('📥 [TRANSFORM-BACK] Parsing Cortensor response...');
    const cortensorData = await cortensorResponse.json() as CortensorResponse;
    console.log('📥 [TRANSFORM-BACK] Cortensor data parsed, choices count:', cortensorData.choices?.length || 0);

    // Transform choices to OpenAI format
    console.log('🔧 [TRANSFORM-BACK] Transforming choices to OpenAI format...');
    const transformedChoices = cortensorData.choices.map((choice: CortensorChoice, index: number) => {
      let content = choice.text || '';
      console.log(`🔧 [TRANSFORM-BACK] Processing choice ${index}, content length:`, content.length);

      // Append search results as markdown URLs to content if they exist
      if (webSearchResults && webSearchResults.length > 0) {
        console.log('📝 [TRANSFORM-BACK] Appending web search results to response...');
        const searchResultsMarkdown = formatSearchResults(webSearchResults);
        if (searchResultsMarkdown) {
          content += `\n\n**Search Results:** ${searchResultsMarkdown}`;
          console.log('📝 [TRANSFORM-BACK] Search results appended, new content length:', content.length);
        } else {
          console.log('📝 [TRANSFORM-BACK] No search results markdown to append');
        }
      } else {
        console.log('🔄 [TRANSFORM-BACK] No web search results to append');
      }

      const message: any = {
        role: 'assistant' as const,
        content: content
      };

      return {
        index: choice.index ?? index,
        message,
        finish_reason: choice.finish_reason || 'stop'
      };
    });

    console.log('🔧 [TRANSFORM-BACK] Choices transformed successfully, count:', transformedChoices.length);

    // Transform usage information
    console.log('📊 [TRANSFORM-BACK] Creating usage information...');
    const transformedUsage = cortensorData.usage ? {
      prompt_tokens: cortensorData.usage.prompt_tokens,
      completion_tokens: cortensorData.usage.completion_tokens,
      total_tokens: cortensorData.usage.total_tokens
    } : {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    };

    console.log('📊 [TRANSFORM-BACK] Usage stats:', {
      promptTokens: transformedUsage.prompt_tokens,
      completionTokens: transformedUsage.completion_tokens,
      totalTokens: transformedUsage.total_tokens
    });

    // Create OpenAI-formatted response
    console.log('🔧 [TRANSFORM-BACK] Constructing final OpenAI response...');
    const openAIResponse: OpenAIResponse = {
      id: cortensorData.id || `cortensor-${Date.now()}`,
      object: 'chat.completion',
      created: cortensorData.created || Math.floor(Date.now() / 1000),
      model: cortensorData.model || 'cortensor-model',
      choices: transformedChoices,
      usage: transformedUsage
    };

    console.log('🔧 [TRANSFORM-BACK] OpenAI response created:', {
      id: openAIResponse.id,
      choicesCount: openAIResponse.choices.length,
      finalContentLength: openAIResponse.choices[0]?.message?.content?.length || 0,
      totalTokens: openAIResponse?.usage?.total_tokens
    });

    console.log('✅ [TRANSFORM-BACK] Creating Response object...');
    // Return as Response object
    return new Response(
      JSON.stringify(openAIResponse),
      {
        status: cortensorResponse.status,
        statusText: cortensorResponse.statusText,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('❌ [TRANSFORM-BACK] Error transforming from Cortensor format:', error);
    console.error('❌ [TRANSFORM-BACK] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Return standardized error response
    console.log('🔄 [TRANSFORM-BACK] Creating error response...');
    const errorResponse = createErrorResponse();
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// ============================================================================
// NOTES
// ============================================================================
// - Streaming is currently disabled - all responses are sent at once
// - The transformer handles both successful responses and error cases
// - All responses are converted to OpenAI-compatible format for SDK integration