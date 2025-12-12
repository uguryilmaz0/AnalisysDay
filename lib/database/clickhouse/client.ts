/**
 * ClickHouse Client - Singleton Pattern
 * Optimized connection management with pooling
 */

import { createClient, ClickHouseClient } from '@clickhouse/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
if (typeof window === 'undefined') {
  dotenv.config({ path: path.join(process.cwd(), '.env.local') });
  dotenv.config({ path: path.join(process.cwd(), '.env') });
}

// ============================================
// Configuration
// ============================================

interface ClickHouseConfig {
  host: string;
  database: string;
  username: string;
  password: string;
  request_timeout?: number;
  max_open_connections?: number;
  compression?: {
    request: boolean;
    response: boolean;
  };
  clickhouse_settings?: {
    max_execution_time?: number;
    enable_http_compression?: number;
  };
}

// ============================================
// Singleton Client
// ============================================

class ClickHouseClientManager {
  private static instance: ClickHouseClientManager;
  private client: ClickHouseClient | null = null;
  private config: ClickHouseConfig;
  private isConnected: boolean = false;
  
  // Performance Metrics
  private metrics = {
    totalQueries: 0,
    totalErrors: 0,
    avgQueryTime: 0,
    lastError: null as string | null,
  };

  private constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ClickHouseClientManager {
    if (!ClickHouseClientManager.instance) {
      ClickHouseClientManager.instance = new ClickHouseClientManager();
    }
    return ClickHouseClientManager.instance;
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfig(): ClickHouseConfig {
    const host = process.env.CLICKHOUSE_HOST;
    const database = process.env.CLICKHOUSE_DATABASE || 'analysisday';
    const username = process.env.CLICKHOUSE_USER || 'default';
    const password = process.env.CLICKHOUSE_PASSWORD;

    if (!host || !password) {
      throw new Error(
        'ClickHouse configuration missing. Required: CLICKHOUSE_HOST, CLICKHOUSE_PASSWORD'
      );
    }

    return {
      host,
      database,
      username,
      password,
      request_timeout: parseInt(process.env.CLICKHOUSE_REQUEST_TIMEOUT || '30000'),
      max_open_connections: parseInt(process.env.CLICKHOUSE_MAX_OPEN_CONNECTIONS || '10'),
      compression: {
        request: process.env.CLICKHOUSE_COMPRESSION !== 'false',
        response: process.env.CLICKHOUSE_COMPRESSION !== 'false',
      },
      clickhouse_settings: {
        max_execution_time: parseInt(process.env.CLICKHOUSE_MAX_EXECUTION_TIME || '60'),
        enable_http_compression: process.env.CLICKHOUSE_COMPRESSION !== 'false' ? 1 : 0,
      },
    };
  }

  /**
   * Initialize connection
   */
  public async connect(): Promise<void> {
    if (this.client && this.isConnected) {
      console.log('✅ ClickHouse already connected');
      return;
    }

    try {
      console.log('🔌 Connecting to ClickHouse...', {
        host: this.config.host,
        database: this.config.database,
      });

      this.client = createClient({
        host: this.config.host,
        username: this.config.username,
        password: this.config.password,
        database: this.config.database,
        request_timeout: this.config.request_timeout,
        max_open_connections: this.config.max_open_connections,
        compression: this.config.compression,
        clickhouse_settings: {
          max_execution_time: this.config.clickhouse_settings?.max_execution_time,
          enable_http_compression: this.config.clickhouse_settings?.enable_http_compression ? 1 : 0,
        },
      });

      // Test connection
      await this.ping();
      
      this.isConnected = true;
      console.log('✅ ClickHouse connected successfully');
    } catch (error) {
      this.isConnected = false;
      this.metrics.lastError = error instanceof Error ? error.message : String(error);
      console.error('❌ ClickHouse connection failed:', error);
      throw new Error(`ClickHouse connection failed: ${this.metrics.lastError}`);
    }
  }

  /**
   * Get client instance
   */
  public getClient(): ClickHouseClient {
    if (!this.client || !this.isConnected) {
      throw new Error('ClickHouse client not connected. Call connect() first.');
    }
    return this.client;
  }

  /**
   * Ping database
   */
  public async ping(): Promise<boolean> {
    try {
      const result = await this.client?.query({
        query: 'SELECT 1 as ping',
        format: 'JSONEachRow',
      });

      const data = await result?.json();
      return Boolean(data && data.length > 0);
    } catch (error) {
      console.error('❌ ClickHouse ping failed:', error);
      return false;
    }
  }

  /**
   * Execute query with performance tracking
   */
  public async query<T = unknown>(
    query: string,
    params?: Record<string, unknown>
  ): Promise<T[]> {
    const startTime = Date.now();
    
    try {
      this.metrics.totalQueries++;

      const client = this.getClient();
      const result = await client.query({
        query,
        query_params: params,
        format: 'JSONEachRow',
      });

      const data = await result.json() as T[];
      
      // Update metrics
      const executionTime = Date.now() - startTime;
      this.metrics.avgQueryTime = 
        (this.metrics.avgQueryTime * (this.metrics.totalQueries - 1) + executionTime) / 
        this.metrics.totalQueries;

      console.log(`✅ Query executed in ${executionTime}ms`);
      
      return data;
    } catch (error) {
      this.metrics.totalErrors++;
      this.metrics.lastError = error instanceof Error ? error.message : String(error);
      
      const executionTime = Date.now() - startTime;
      console.error(`❌ Query failed after ${executionTime}ms:`, error);
      console.error('Query:', query);
      console.error('Params:', params);
      
      throw error;
    }
  }

  /**
   * Execute query and get single row
   */
  public async queryOne<T = unknown>(
    query: string,
    params?: Record<string, unknown>
  ): Promise<T | null> {
    const results = await this.query<T>(query, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Execute insert
   */
  public async insert<T = unknown>(
    table: string,
    data: T[]
  ): Promise<void> {
    try {
      const client = this.getClient();
      await client.insert({
        table,
        values: data,
        format: 'JSONEachRow',
      });

      console.log(`✅ Inserted ${data.length} rows into ${table}`);
    } catch (error) {
      console.error(`❌ Insert failed for table ${table}:`, error);
      throw error;
    }
  }

  /**
   * Execute command (DDL, etc.)
   */
  public async command(query: string): Promise<void> {
    try {
      const client = this.getClient();
      await client.command({
        query,
      });

      console.log('✅ Command executed successfully');
    } catch (error) {
      console.error('❌ Command failed:', error);
      throw error;
    }
  }

  /**
   * Get connection statistics
   */
  public getStats() {
    return {
      isConnected: this.isConnected,
      totalQueries: this.metrics.totalQueries,
      totalErrors: this.metrics.totalErrors,
      avgQueryTime: Math.round(this.metrics.avgQueryTime),
      errorRate: this.metrics.totalQueries > 0 
        ? (this.metrics.totalErrors / this.metrics.totalQueries * 100).toFixed(2) + '%'
        : '0%',
      lastError: this.metrics.lastError,
      config: {
        host: this.config.host,
        database: this.config.database,
        maxConnections: this.config.max_open_connections,
        requestTimeout: this.config.request_timeout,
      },
    };
  }

  /**
   * Close connection
   */
  public async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
        this.isConnected = false;
        console.log('✅ ClickHouse disconnected');
      } catch (error) {
        console.error('❌ ClickHouse disconnect failed:', error);
      }
    }
  }
}

// ============================================
// Exports
// ============================================

// Singleton instance
export const clickHouseClient = ClickHouseClientManager.getInstance();

// Helper functions
export async function getClickHouseClient(): Promise<ClickHouseClient> {
  await clickHouseClient.connect();
  return clickHouseClient.getClient();
}

export async function executeQuery<T = unknown>(
  query: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  return clickHouseClient.query<T>(query, params);
}

export async function executeQueryOne<T = unknown>(
  query: string,
  params?: Record<string, unknown>
): Promise<T | null> {
  return clickHouseClient.queryOne<T>(query, params);
}

export async function getClickHouseStats() {
  return clickHouseClient.getStats();
}

// Export the manager class for direct usage
export { ClickHouseClientManager };
