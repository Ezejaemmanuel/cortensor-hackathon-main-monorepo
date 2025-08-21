export interface RedisConfig {
  url?: string;
  token?: string;
}

export interface SessionData {
  id: number;
  userAddress: string;
  created_at: Date;
  last_used: Date;
  metadata?: Record<string, any>;
}

export interface CreateSessionParams {
  userAddress: string;
  metadata?: Record<string, any>;
}