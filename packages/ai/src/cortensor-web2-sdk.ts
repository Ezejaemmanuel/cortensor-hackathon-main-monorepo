/**
 * Cortensor Web2 SDK
 * A well-typed JavaScript SDK for interacting with Cortensor Router Node API
 * 
 * API Testing Results (as of latest test):
 * - /api/v1/sessions: ✅ Working - Returns {"count":0,"sessions":[]}
 * - /api/v1/miners: ✅ Working - Returns {"nodes":{},"stats":{}}
 * - /api/v1/info: ❌ Error - "Failed to get router information: 'total'"
 * - /api/v1/status: ❌ Error - "Failed to get router status: 'total_count'"
 * - /api/v1/tasks: ❌ 404 Not Found (endpoint may not exist)
 * - /api/v1/completions: ❌ Authentication issues - "Invalid Authorization header format"
 * 
 * Note: Completions endpoint requires different authentication format than other endpoints
 */

// Types and Interfaces
export interface CortensorConfig {
  apiKey?: string;
  baseURL?: string;
}

export interface RouterInfo {
  // Based on API error response, this endpoint may have issues
  // Structure to be determined when API is functional
  error?: string;
  [key: string]: any;
}

export interface RouterStatus {
  // Based on API error response, this endpoint may have issues
  // Structure to be determined when API is functional
  error?: string;
  [key: string]: any;
}

export interface MinerNode {
  // Based on actual API response: {"nodes":{},"stats":{}}
  [key: string]: any;
}

export interface MinersResponse {
  nodes: Record<string, MinerNode>;
  stats: Record<string, any>;
}

export interface Session {
  id: number;
  name: string;
  metadata?: string;
  address?: string;
  created_at: string;
  updated_at?: string;
  status?: string;
  minNumOfNodes?: number;
  maxNumOfNodes?: number;
  redundant?: number;
  numOfValidatorNodes?: number;
  mode?: number;
  reserveEphemeralNodes?: boolean;
  total_tasks?: number;
  active_tasks?: number;
}

export interface SessionsResponse {
  count: number;
  sessions: Session[];
}

export interface Task {
  id: number;
  session_id: number;
  status: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  prompt?: string;
  response?: string;
  error?: string;
  execution_time?: number;
  miner_id?: string;
}

export interface CreateSessionRequest {
  name: string;
  metadata?: string;
  address?: string;
  minNumOfNodes?: number;
  maxNumOfNodes?: number;
  redundant?: number;
  numOfValidatorNodes?: number;
  mode?: number;
  reserveEphemeralNodes?: boolean;
}

export interface CompletionRequest {
  prompt: string;
  prompt_type?: number;
  prompt_template?: string;
  stream?: boolean;
  timeout?: number;
  client_reference?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
}

export interface CompletionWithSessionRequest extends CompletionRequest {
  session_id: number;
}

export interface CompletionResponse {
  response: string;
  session_id: number;
  task_id?: number;
  execution_time?: number;
  tokens_used?: number;
  miner_id?: string;
  status?: string;
  created_at?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  message?: string;
  timestamp?: string;
}

/**
 * Cortensor Web2 SDK Class
 */
export class CortensorWeb2SDK {
  private apiKey: string;
  private baseURL: string;

  constructor(config: CortensorConfig = {}) {
    // Get API key from config or environment
    this.apiKey = config.apiKey || process.env.CORTENSOR_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('CORTENSOR_API_KEY is required. Provide it via config or environment variable.');
    }

    // Get base URL from config or environment
    this.baseURL = config.baseURL || process.env.CORTENSOR_BASE_URL || '';
    if (!this.baseURL) {
      throw new Error('CORTENSOR_BASE_URL is required. Provide it via config or environment variable.');
    }

    // Ensure baseURL doesn't end with slash
    this.baseURL = this.baseURL.replace(/\/$/, '');
  }

  /**
   * Make HTTP request with proper headers
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, requestOptions);
      const data = await response.json();

      return {
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.message || `HTTP ${response.status}`,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 0,
      };
    }
  }

  /**
   * Get router information
   * Note: This endpoint currently returns error: "Failed to get router information: 'total'"
   */
  async getInfo(): Promise<ApiResponse<RouterInfo>> {
    return this.makeRequest<RouterInfo>('/api/v1/info');
  }

  /**
   * Get router status
   * Note: This endpoint currently returns error: "Failed to get router status: 'total_count'"
   */
  async getStatus(): Promise<ApiResponse<RouterStatus>> {
    return this.makeRequest<RouterStatus>('/api/v1/status');
  }

  /**
   * Get all connected miners
   */
  async getMiners(): Promise<ApiResponse<MinersResponse>> {
    return this.makeRequest<MinersResponse>('/api/v1/miners');
  }

  /**
   * Get all sessions
   */
  async getSessions(): Promise<ApiResponse<SessionsResponse>> {
    return this.makeRequest<SessionsResponse>('/api/v1/sessions');
  }

  /**
   * Get specific session by ID
   */
  async getSession(sessionId: number): Promise<ApiResponse<Session>> {
    return this.makeRequest<Session>(`/api/v1/sessions/${sessionId}`);
  }

  /**
   * Get all tasks for a session
   * Note: Tasks endpoints return 404 Not Found - may not be implemented
   */
  async getTasks(sessionId: number): Promise<ApiResponse<Task[]>> {
    return this.makeRequest<Task[]>(`/api/v1/tasks/${sessionId}`);
  }

  /**
   * Get specific task by session ID and task ID
   * Note: Tasks endpoints return 404 Not Found - may not be implemented
   */
  async getTask(sessionId: number, taskId: number): Promise<ApiResponse<Task>> {
    return this.makeRequest<Task>(`/api/v1/tasks/${sessionId}/${taskId}`);
  }

  /**
   * Create a new session
   */
  async createSession(request: CreateSessionRequest): Promise<ApiResponse<Session>> {
    return this.makeRequest<Session>('/api/v1/create', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Submit completion request with session ID in URL path
   * Note: This endpoint has authentication issues - "Invalid Authorization header format"
   * The Bearer token format that works for other endpoints doesn't work here
   */
  async submitCompletionWithPath(
    sessionId: number,
    request: CompletionRequest
  ): Promise<ApiResponse<CompletionResponse>> {
    return this.makeRequest<CompletionResponse>(`/api/v1/completions/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Submit completion request with session ID in request body
   * Note: This endpoint has authentication issues - "Invalid Authorization header format"
   * The Bearer token format that works for other endpoints doesn't work here
   */
  async submitCompletion(
    request: CompletionWithSessionRequest
  ): Promise<ApiResponse<CompletionResponse>> {
    return this.makeRequest<CompletionResponse>('/api/v1/completions', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Submit streaming completion request with session ID in URL path
   */
  async submitStreamingCompletionWithPath(
    sessionId: number,
    request: CompletionRequest
  ): Promise<ReadableStream<Uint8Array> | null> {
    const url = `${this.baseURL}/api/v1/completions/${sessionId}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ ...request, stream: false }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.body;
    } catch (error) {
      console.error('Streaming completion error:', error);
      return null;
    }
  }

  /**
   * Submit streaming completion request with session ID in request body
   */
  async submitStreamingCompletion(
    request: CompletionWithSessionRequest
  ): Promise<ReadableStream<Uint8Array> | null> {
    const url = `${this.baseURL}/api/v1/completions`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ ...request, stream: false }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.body;
    } catch (error) {
      console.error('Streaming completion error:', error);
      return null;
    }
  }

  /**
   * Helper method to create default completion request
   * Provides sensible defaults for all optional parameters
   * 
   * Default values:
   * - prompt_type: 0
   * - prompt_template: '' (empty string)
   * - stream: false
   * - timeout: 60 seconds
   * - client_reference: 'user-request-{timestamp}'
   * - max_tokens: 1024
   * - temperature: 0.7
   * - top_p: 0.95
   * - top_k: 40
   * - presence_penalty: 0
   * - frequency_penalty: 0
   * 
   * @param prompt The text prompt for completion
   * @param overrides Optional parameters to override defaults
   * @returns CompletionRequest with defaults applied
   * 
   * @example
   * ```typescript
   * const request = sdk.createCompletionRequest("Hello world");
   * // Uses all defaults
   * 
   * const customRequest = sdk.createCompletionRequest("Hello world", {
   *   max_tokens: 500,
   *   temperature: 0.9
   * });
   * // Overrides max_tokens and temperature, uses defaults for others
   * ```
   */
  createCompletionRequest(prompt: string, overrides: Partial<CompletionRequest> = {}): CompletionRequest {
    return {
      prompt,
      prompt_type: overrides.prompt_type ?? 0,
      prompt_template: overrides.prompt_template ?? '',
      stream: overrides.stream ?? false,
      timeout: overrides.timeout ?? 60,
      client_reference: overrides.client_reference ?? `user-request-${Date.now()}`,
      max_tokens: overrides.max_tokens ?? 1024,
      temperature: overrides.temperature ?? 0.7,
      top_p: overrides.top_p ?? 0.95,
      top_k: overrides.top_k ?? 40,
      presence_penalty: overrides.presence_penalty ?? 0,
      frequency_penalty: overrides.frequency_penalty ?? 0,
      ...overrides,
    };
  }

  /**
   * Helper method to create completion request with session ID
   * Provides sensible defaults for creating completion tasks
   * 
   * @param prompt The text prompt for completion
   * @param sessionId The session ID to associate with this completion
   * @param overrides Optional parameters to override defaults
   * @returns CompletionWithSessionRequest with session_id and defaults applied
   * 
   * @example
   * ```typescript
   * const request = sdk.createCompletionWithSessionRequest("Explain AI", 123);
   * // Creates request with session_id: 123 and all defaults
   * 
   * const customRequest = sdk.createCompletionWithSessionRequest("Explain AI", 123, {
   *   max_tokens: 2048,
   *   temperature: 0.5
   * });
   * // Custom parameters with session_id: 123
   * ```
   */
  createCompletionWithSessionRequest(
    prompt: string, 
    sessionId: number, 
    overrides: Partial<CompletionRequest> = {}
  ): CompletionWithSessionRequest {
    const baseRequest = this.createCompletionRequest(prompt, overrides);
    return {
      ...baseRequest,
      session_id: sessionId,
    };
  }

  /**
   * Convenience method to submit completion with automatic defaults
   * Creates a completion request with sensible defaults if not provided
   * 
   * This is the easiest way to submit a completion - just provide prompt and session ID,
   * and all other parameters will use sensible defaults.
   * 
   * @param prompt The text prompt for completion
   * @param sessionId The session ID to associate with this completion
   * @param overrides Optional parameters to override defaults
   * @returns Promise resolving to API response with completion result
   * 
   * @example
   * ```typescript
   * // Simple usage with defaults
   * const response = await sdk.submitCompletionWithDefaults(
   *   "What is machine learning?", 
   *   123
   * );
   * 
   * // With custom parameters
   * const response = await sdk.submitCompletionWithDefaults(
   *   "Write a story", 
   *   123, 
   *   {
   *     max_tokens: 2048,
   *     temperature: 0.9,
   *     client_reference: "story-generation"
   *   }
   * );
   * ```
   */
  async submitCompletionWithDefaults(
    prompt: string,
    sessionId: number,
    overrides: Partial<CompletionRequest> = {}
  ): Promise<ApiResponse<CompletionResponse>> {
    const request = this.createCompletionWithSessionRequest(prompt, sessionId, overrides);
    return this.submitCompletion(request);
  }

  /**
   * Helper method to create default session creation request
   */
  createSessionRequest(name: string, overrides: Partial<CreateSessionRequest> = {}): CreateSessionRequest {
    return {
      name,
      metadata: 'Session metadata',
      address: '0x0000000000000000000000000000000000000000',
      minNumOfNodes: 0,
      maxNumOfNodes: 0,
      redundant: 1,
      numOfValidatorNodes: 0,
      mode: 0,
      reserveEphemeralNodes: false,
      ...overrides,
    };
  }
}

/**
 * Default export for convenience
 */
export default CortensorWeb2SDK;

/**
 * Factory function to create SDK instance
 */
export function createCortensorSDK(config?: CortensorConfig): CortensorWeb2SDK {
  return new CortensorWeb2SDK(config);
}