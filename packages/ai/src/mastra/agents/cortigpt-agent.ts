/**
 * CortiGPT Agent using Cortensor Provider
 * A helpful AI assistant to answer user questions and provide assistance
 * Enhanced with memory capabilities using Upstash for persistent storage
 */

import { Agent } from '@mastra/core';
import { Memory } from '@mastra/memory';
import { UpstashStore } from '@mastra/upstash';
import { cortensorModel, createTavilySearch } from 'cortensor-openai-provider';

/**
 * Environment variable validation
 * Ensures required Upstash credentials are available
 */
function validateEnvironment() {
    const requiredEnvVars = {
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    };

    const missingVars = Object.entries(requiredEnvVars)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables for Upstash: ${missingVars.join(', ')}. ` +
            'Please create a .env file with these variables or set them in your environment.'
        );
    }

    return requiredEnvVars;
}


/**
 * Initialize memory with Upstash storage
 * Validates environment variables before creating the memory instance
 */
function createMemoryWithUpstash() {
    const envVars = validateEnvironment();

    return new Memory({
        // Configure Upstash as the storage provider
        storage: new UpstashStore({
            url: envVars.UPSTASH_REDIS_REST_URL!,
            token: envVars.UPSTASH_REDIS_REST_TOKEN!,
        }),

        // Memory configuration options
        options: {
            // Include last 5 messages for conversation context
            lastMessages: 5,

            // Disable semantic recall for this general assistant
            semanticRecall: false,

            // Enable thread title generation for better organization
            threads: {
                generateTitle: true,
            },
        },
    });
}

/**
 * CortiGPT Agent Configuration
 * Uses Cortensor as the underlying language model with Upstash memory and Tavily web search
 * 
 * Web Search Usage:
 * - Use [search] in your message to trigger web search: "[search] What's the latest news about AI?"
 * - Use [no-search] to prevent search: "[no-search] Tell me a joke"
 * - Search is automatically triggered by [search] markers (prompt mode)
 * 
 * Note: Requires TAVILY_API_KEY environment variable for web search functionality
 */

export const cortiGPTAgent = new Agent({
    name: 'CortiGPT',
    instructions: `You are CortiGPT, a helpful AI assistant powered by Cortensor. Your goal is to help users by answering their questions and providing assistance with various tasks. Be friendly, informative, and concise in your responses.`,

    // Use Cortensor as the language model with custom configuration and web search
    model: cortensorModel({
        sessionId: 72,
        maxTokens: 3000,
        temperature: 0.4,
        webSearch: {
            mode: 'prompt', // Search triggered by [search] markers in user messages
            provider: createTavilySearch({
                apiKey: process.env.TAVILY_API_KEY || "nothing",
            }),
            maxResults: 3
        }
    }),

    // No tools needed for this general assistant
    tools: {},

    // Add memory with Upstash storage
    memory: createMemoryWithUpstash(),
});