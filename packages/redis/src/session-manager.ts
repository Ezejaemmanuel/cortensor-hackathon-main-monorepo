import type { Redis } from '@upstash/redis';
import { createRedisClient } from './client.js';
import type { SessionData, CreateSessionParams, RedisConfig } from './types.js';

export class RedisSessionManager {
  private redis: Redis;
  private sessionCounter: number = 0;
  private readonly SESSION_KEY_PREFIX = 'cortensor:session:';
  private readonly USER_SESSION_KEY_PREFIX = 'cortensor:user_session:';
  private readonly COUNTER_KEY = 'cortensor:session_counter';

  constructor(config?: RedisConfig) {
    this.redis = createRedisClient(config);
    this.initializeCounter();
  }

  private async initializeCounter(): Promise<void> {
    try {
      const counter = await this.redis.get(this.COUNTER_KEY);
      this.sessionCounter = counter ? Number(counter) : 0;
    } catch (error) {
      console.warn('Failed to initialize session counter:', error);
      this.sessionCounter = 0;
    }
  }

  private async getNextSessionId(): Promise<number> {
    this.sessionCounter++;
    await this.redis.set(this.COUNTER_KEY, this.sessionCounter);
    return this.sessionCounter;
  }

  /**
   * Get session for a user address
   */
  async getSessionByUserAddress(userAddress: string): Promise<SessionData | null> {
    try {
      const sessionId = await this.redis.get(`${this.USER_SESSION_KEY_PREFIX}${userAddress.toLowerCase()}`);
      if (!sessionId) {
        return null;
      }

      const sessionData = await this.redis.get(`${this.SESSION_KEY_PREFIX}${sessionId}`);
      if (!sessionData) {
        // Clean up orphaned user session reference
        await this.redis.del(`${this.USER_SESSION_KEY_PREFIX}${userAddress.toLowerCase()}`);
        return null;
      }

      // Update last_used timestamp
      const session = sessionData as SessionData;
      session.last_used = new Date();
      await this.redis.set(`${this.SESSION_KEY_PREFIX}${sessionId}`, session);

      return session;
    } catch (error) {
      console.error('Failed to get session by user address:', error);
      return null;
    }
  }

  /**
   * Create a new session for a user
   */
  async createSession(params: CreateSessionParams): Promise<SessionData> {
    try {
      const sessionId = await this.getNextSessionId();
      const now = new Date();
      
      const sessionData: SessionData = {
        id: sessionId,
        userAddress: params.userAddress.toLowerCase(),
        created_at: now,
        last_used: now,
        metadata: params.metadata || {}
      };

      // Store session data
      await this.redis.set(`${this.SESSION_KEY_PREFIX}${sessionId}`, sessionData);
      
      // Map user address to session ID
      await this.redis.set(`${this.USER_SESSION_KEY_PREFIX}${params.userAddress.toLowerCase()}`, sessionId);

      console.log(`Created new session ${sessionId} for user ${params.userAddress}`);
      return sessionData;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw new Error('Failed to create session');
    }
  }

  /**
   * Get or create session for a user address
   */
  async getOrCreateSession(userAddress: string, metadata?: Record<string, any>): Promise<SessionData> {
    let session = await this.getSessionByUserAddress(userAddress);
    
    if (!session) {
      session = await this.createSession({ userAddress, metadata });
    }
    
    return session;
  }

  /**
   * Delete session for a user
   */
  async deleteSession(userAddress: string): Promise<boolean> {
    try {
      const sessionId = await this.redis.get(`${this.USER_SESSION_KEY_PREFIX}${userAddress.toLowerCase()}`);
      if (!sessionId) {
        return false;
      }

      // Delete session data and user mapping
      await Promise.all([
        this.redis.del(`${this.SESSION_KEY_PREFIX}${sessionId}`),
        this.redis.del(`${this.USER_SESSION_KEY_PREFIX}${userAddress.toLowerCase()}`)
      ]);

      console.log(`Deleted session ${sessionId} for user ${userAddress}`);
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }

  /**
   * Get session by ID
   */
  async getSessionById(sessionId: number): Promise<SessionData | null> {
    try {
      const sessionData = await this.redis.get(`${this.SESSION_KEY_PREFIX}${sessionId}`);
      return sessionData as SessionData | null;
    } catch (error) {
      console.error('Failed to get session by ID:', error);
      return null;
    }
  }

  /**
   * Check if session exists for user
   */
  async hasSession(userAddress: string): Promise<boolean> {
    try {
      const sessionId = await this.redis.get(`${this.USER_SESSION_KEY_PREFIX}${userAddress.toLowerCase()}`);
      return sessionId !== null;
    } catch (error) {
      console.error('Failed to check session existence:', error);
      return false;
    }
  }

  /**
   * Get default session ID from environment (for development)
   */
  getDefaultSessionId(): number | null {
    const defaultSessionId = process.env.DEFAULT_SESSION_ID;
    return defaultSessionId ? parseInt(defaultSessionId, 10) : null;
  }
}