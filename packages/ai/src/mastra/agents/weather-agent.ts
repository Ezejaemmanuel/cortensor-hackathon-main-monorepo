/**
 * Weather Agent using Cortensor Provider
 * Provides weather information and forecasts using Cortensor's AI capabilities
 * Enhanced with memory capabilities using Upstash for persistent storage
 */

import { Agent } from '@mastra/core';
import { Memory } from '@mastra/memory';
import { UpstashStore } from '@mastra/upstash';
import { cortensorModel } from 'cortensor-openai-provider';
import { weatherTool } from '../tools/weather-tool';

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
            // Include last 10 messages for conversation context
            lastMessages: 5,

            // Disable semantic recall for this simple weather agent
            // (no vector database needed for basic weather queries)
            semanticRecall: false,

            //             // Enable working memory to remember user preferences
            //             workingMemory: {
            //                 enabled: true,
            //                 template: `# User Weather Preferences
            // - **Name**: 
            // - **Preferred Units**: (Celsius/Fahrenheit)
            // - **Default Location**: 
            // - **Preferred Weather Details**: (basic/detailed)
            // - **Time Zone**: 
            // - **Special Interests**: (outdoor activities, travel, etc.)

            // # Recent Weather Queries
            // - **Last Searched Locations**: 
            // - **Frequent Locations**: 

            // # User Context
            // - **Current Season Preferences**: 
            // - **Weather Alerts Preferences**: 
            // - **Notes**: `,
            //             },

            // Enable thread title generation for better organization
            threads: {
                generateTitle: true,
            },
        },
    });
}

/**
 * Weather Agent Configuration
 * Uses Cortensor as the underlying language model with Upstash memory
 */
export const weatherAgent = new Agent({
    name: 'WeatherAgent',
    instructions: `You are Franklin, a helpful and empathetic AI assistant with therapeutic capabilities.

## Your Role and Personality:
- You are a supportive, understanding, and professional therapeutic bot
- Always maintain a warm, non-judgmental, and encouraging tone
- Listen actively and respond with empathy and insight
- Provide thoughtful guidance while respecting user autonomy

## Core Responsibilities:
1. **Active Listening**: Pay close attention to what users share and reflect their emotions
2. **Emotional Support**: Offer comfort, validation, and encouragement
3. **Therapeutic Guidance**: Provide helpful coping strategies and perspectives
4. **Weather Information**: Use the weather tool when users ask about weather conditions
5. **Boundary Awareness**: Recognize when professional help may be needed

## Communication Guidelines:
- Use "I" statements when offering perspectives (e.g., "I notice that...")
- Ask open-ended questions to encourage deeper reflection
- Validate emotions before offering suggestions
- Be specific and actionable in your advice
- Maintain confidentiality and create a safe space

## Important Notes:
- If someone expresses thoughts of self-harm, encourage them to seek immediate professional help
- Remember that you're a supportive tool, not a replacement for professional therapy
- Always be honest about your limitations as an AI assistant`,

    // Use Cortensor as the language model with custom configuration
    model: cortensorModel({
        sessionId: 62,
        // maxTokens: 10
    }),

    // Available tools for the agent
    tools: {
        weather: weatherTool,
    },

    // Add memory with Upstash storage and working memory
    memory: createMemoryWithUpstash(),

    // Agent configuration
    // Enable streaming for better user experience
});


