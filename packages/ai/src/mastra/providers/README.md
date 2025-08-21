# Cortensor Provider for Mastra AI

This directory contains the Cortensor AI provider implementation for Mastra AI, enabling seamless integration with Cortensor's API through the Vercel AI SDK.

## Overview

The Cortensor provider uses `createOpenAICompatible` from `@ai-sdk/openai-compatible` with a custom fetch wrapper to handle:
- Session management
- Request/response format transformation
- Error handling
- Streaming support

## Files Structure

- `cortensor-provider.ts` - Main provider implementation
- `cortensor-session-manager.ts` - Session lifecycle management
- `cortensor-transformers.ts` - Request/response format transformations
- `index.ts` - Exports and type definitions

## Usage

### Basic Usage

```typescript
import { cortensorModel } from '../providers/cortensor-provider';
import { Agent } from '@mastra/core';

const agent = new Agent({
  name: 'MyAgent',
  model: cortensorModel,
  instructions: 'You are a helpful assistant.',
});

const response = await agent.generate('Hello, how are you?');
```

### Custom Configuration

```typescript
import { createCortensorProvider } from '../providers/cortensor-provider';

const customProvider = createCortensorProvider({
  apiKey: 'your-api-key',
  baseURL: 'https://api.cortensor.com/v1',
  timeout: 60
});

const customModel = customProvider('custom-model');
```

### Environment Variables

Set the following environment variables:

```bash
CORTENSOR_API_KEY=your-cortensor-api-key
CORTENSOR_BASE_URL=https://api.cortensor.com  # Optional, defaults to https://api.cortensor.com
```

## Features

### Session Management
- Automatic session creation and reuse
- Session ID passed in URL path (`/api/v1/completions/{session_id}`)
- Session timeout handling (30 minutes default)
- Singleton pattern for efficient session management

### Format Transformation
- Converts OpenAI message format to Cortensor prompt format
- Transforms Cortensor responses back to OpenAI format
- Maintains compatibility with Vercel AI SDK

### Error Handling
- Graceful error handling with proper error responses
- Logging for debugging
- Fallback responses for API failures

### Streaming Support
- Real-time streaming responses
- OpenAI-compatible streaming format
- Proper stream termination

## API Reference

### CortensorSessionManager

```typescript
class CortensorSessionManager {
  async getOrCreateSession(): Promise<CortensorSession>
  async invalidateSession(): Promise<void>
  getCurrentSessionId(): number | null
}
```

### Transform Functions

```typescript
function transformToCortensor(requestBody: string): Partial<CortensorRequest>
function transformToOpenAI(cortensorResponse: Response): Promise<Response>
function transformStreamToOpenAI(cortensorStream: ReadableStream): ReadableStream
```

## Integration with Weather Agent

The weather agent has been updated to use the Cortensor provider:

```typescript
import { cortensorModel } from '../providers/cortensor-provider';

export const weatherAgent = new Agent({
  name: 'WeatherAgent',
  model: cortensorModel, // Using Cortensor instead of OpenAI
  tools: { weather: weatherTool },
});
```

## Notes

- Session management is currently implemented with placeholder logic
- In production, integrate with actual Cortensor session APIs
- Token counting is not available from Cortensor API
- All requests are logged for debugging purposes

## Future Improvements

1. Implement real Cortensor session API integration
2. Add token usage tracking if supported by Cortensor
3. Implement retry logic for failed requests
4. Add configuration for session timeout
5. Support for multiple concurrent sessions