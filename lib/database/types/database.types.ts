/**
 * Generic Database Types
 * Database-agnostic type definitions
 */

// ============================================
// Query Builder Types
// ============================================

export type QueryOperator = 
  | 'eq'     // Equal
  | 'neq'    // Not equal
  | 'gt'     // Greater than
  | 'gte'    // Greater than or equal
  | 'lt'     // Less than
  | 'lte'    // Less than or equal
  | 'in'     // In array
  | 'nin'    // Not in array
  | 'like'   // String contains
  | 'ilike'  // Case-insensitive like
  | 'between'; // Between two values

export type SortDirection = 'asc' | 'desc';

export interface WhereCondition<T = unknown> {
  field: keyof T | string;
  operator: QueryOperator;
  value: unknown;
}

export interface OrderByClause<T = unknown> {
  field: keyof T | string;
  direction: SortDirection;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface QueryOptions<T = unknown> {
  select?: (keyof T | string)[];
  where?: WhereCondition<T>[];
  orderBy?: OrderByClause<T>[];
  pagination?: PaginationOptions;
  groupBy?: (keyof T | string)[];
  having?: WhereCondition<T>[];
}

// ============================================
// Generic Response Types
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface AggregationResult {
  [key: string]: number | string | null;
}

export interface DatabaseResponse<T> {
  success: boolean;
  data?: T;
  error?: DatabaseError;
}

export interface DatabaseError {
  code: string;
  message: string;
  details?: unknown;
}

// ============================================
// Repository Interface
// ============================================

export interface IRepository<T> {
  // CRUD Operations
  findById(id: string | number): Promise<T | null>;
  findOne(options: QueryOptions<T>): Promise<T | null>;
  findMany(options: QueryOptions<T>): Promise<PaginatedResponse<T>>;
  findAll(): Promise<T[]>;
  
  // Aggregate Operations
  count(options?: QueryOptions<T>): Promise<number>;
  aggregate(
    fields: { field: keyof T | string; function: 'sum' | 'avg' | 'min' | 'max' | 'count' }[],
    options?: QueryOptions<T>
  ): Promise<AggregationResult>;
  
  // Utility
  exists(options: QueryOptions<T>): Promise<boolean>;
  getDistinct(field: keyof T | string, options?: QueryOptions<T>): Promise<unknown[]>;
}

// ============================================
// Connection Interface
// ============================================

export interface IDatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  ping(): Promise<boolean>;
  getStats(): ConnectionStats;
}

export interface ConnectionStats {
  activeConnections: number;
  idleConnections: number;
  totalQueries: number;
  avgQueryTime: number;
  lastError?: string;
}

// ============================================
// Query Builder Interface
// ============================================

export interface IQueryBuilder<T> {
  select(...fields: (keyof T | string)[]): IQueryBuilder<T>;
  where(field: keyof T | string, operator: QueryOperator, value: unknown): IQueryBuilder<T>;
  andWhere(field: keyof T | string, operator: QueryOperator, value: unknown): IQueryBuilder<T>;
  orWhere(field: keyof T | string, operator: QueryOperator, value: unknown): IQueryBuilder<T>;
  orderBy(field: keyof T | string, direction: SortDirection): IQueryBuilder<T>;
  groupBy(...fields: (keyof T | string)[]): IQueryBuilder<T>;
  having(field: keyof T | string, operator: QueryOperator, value: unknown): IQueryBuilder<T>;
  limit(count: number): IQueryBuilder<T>;
  offset(count: number): IQueryBuilder<T>;
  
  // Execution
  execute(): Promise<T[]>;
  executeOne(): Promise<T | null>;
  executeCount(): Promise<number>;
  
  // SQL Generation
  toSQL(): string;
  getParams(): Record<string, unknown>;
}

// ============================================
// Cache Interface
// ============================================

export interface ICacheManager {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(pattern?: string): Promise<void>;
  has(key: string): Promise<boolean>;
  getStats(): CacheStats;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: string; // Custom cache key
  enabled?: boolean; // Enable/disable caching
}
