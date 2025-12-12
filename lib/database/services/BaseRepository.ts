/**
 * Generic Base Repository
 * Implements common database operations for any entity
 */

import type {
  IRepository,
  QueryOptions,
  PaginatedResponse,
  AggregationResult,
} from '../types/database.types';
import { clickHouseClient } from '../clickhouse/client';
import { 
  ClickHouseQueryBuilder,
  calculateOffset,
  calculateTotalPages,
} from '../clickhouse/queryBuilder';

// ============================================
// Abstract Base Repository
// ============================================

export abstract class BaseRepository<T> implements IRepository<T> {
  protected tableName: string;
  protected primaryKey: keyof T;

  constructor(tableName: string, primaryKey: keyof T = 'id' as keyof T) {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  // ============================================
  // CRUD Operations
  // ============================================

  /**
   * Find by ID
   */
  async findById(id: string | number): Promise<T | null> {
    try {
      const query = `
        SELECT * 
        FROM ${this.tableName} 
        WHERE ${String(this.primaryKey)} = {id: ${typeof id === 'number' ? 'Int64' : 'String'}}
        LIMIT 1
      `;

      const result = await clickHouseClient.query<T>(query, { id });
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error(`Error finding by ID in ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Find one with options
   */
  async findOne(options: QueryOptions<T>): Promise<T | null> {
    try {
      const builder = new ClickHouseQueryBuilder<T>(this.tableName);

      // Select fields
      if (options.select && options.select.length > 0) {
        builder.select(...options.select);
      }

      // Where conditions
      if (options.where) {
        options.where.forEach((condition, index) => {
          if (index === 0) {
            builder.where(condition.field, condition.operator, condition.value);
          } else {
            builder.andWhere(condition.field, condition.operator, condition.value);
          }
        });
      }

      // Order by
      if (options.orderBy && options.orderBy.length > 0) {
        options.orderBy.forEach(order => {
          builder.orderBy(order.field, order.direction);
        });
      }

      // Limit 1
      builder.limit(1);

      const sql = builder.toSQL();
      const params = builder.getParams();

      const result = await clickHouseClient.query<T>(sql, params);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error(`Error finding one in ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Find many with pagination
   */
  async findMany(options: QueryOptions<T>): Promise<PaginatedResponse<T>> {
    try {
      const page = options.pagination?.page || 1;
      const limit = options.pagination?.limit || 100;
      const offset = options.pagination?.offset ?? calculateOffset(page, limit);

      // Build query
      const builder = new ClickHouseQueryBuilder<T>(this.tableName);

      // Select fields
      if (options.select && options.select.length > 0) {
        builder.select(...options.select);
      }

      // Where conditions
      if (options.where) {
        options.where.forEach((condition, index) => {
          if (index === 0) {
            builder.where(condition.field, condition.operator, condition.value);
          } else {
            builder.andWhere(condition.field, condition.operator, condition.value);
          }
        });
      }

      // Group by
      if (options.groupBy && options.groupBy.length > 0) {
        builder.groupBy(...options.groupBy);
      }

      // Having
      if (options.having) {
        options.having.forEach(condition => {
          builder.having(condition.field, condition.operator, condition.value);
        });
      }

      // Order by
      if (options.orderBy && options.orderBy.length > 0) {
        options.orderBy.forEach(order => {
          builder.orderBy(order.field, order.direction);
        });
      }

      // Pagination
      builder.limit(limit).offset(offset);

      const sql = builder.toSQL();
      const params = builder.getParams();

      // Execute query
      const data = await clickHouseClient.query<T>(sql, params);

      // Get total count
      const total = await this.count(options);

      const totalPages = calculateTotalPages(total, limit);
      const hasMore = page < totalPages;

      return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasMore,
      };
    } catch (error) {
      console.error(`Error finding many in ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Find all (no pagination)
   */
  async findAll(): Promise<T[]> {
    try {
      const query = `SELECT * FROM ${this.tableName}`;
      return await clickHouseClient.query<T>(query);
    } catch (error) {
      console.error(`Error finding all in ${this.tableName}:`, error);
      throw error;
    }
  }

  // ============================================
  // Aggregate Operations
  // ============================================

  /**
   * Count records
   */
  async count(options?: QueryOptions<T>): Promise<number> {
    try {
      let query = `SELECT count() as count FROM ${this.tableName}`;
      let params: Record<string, unknown> = {};

      if (options?.where && options.where.length > 0) {
        const builder = new ClickHouseQueryBuilder<T>(this.tableName);
        
        options.where.forEach((condition, index) => {
          if (index === 0) {
            builder.where(condition.field, condition.operator, condition.value);
          } else {
            builder.andWhere(condition.field, condition.operator, condition.value);
          }
        });

        // Extract WHERE clause
        const fullSQL = builder.toSQL();
        const whereMatch = fullSQL.match(/WHERE (.+?)(?:GROUP BY|ORDER BY|LIMIT|$)/);
        if (whereMatch) {
          query += ` WHERE ${whereMatch[1]}`;
          params = builder.getParams();
        }
      }

      const result = await clickHouseClient.query<{ count: number }>(query, params);
      return result.length > 0 ? result[0].count : 0;
    } catch (error) {
      console.error(`Error counting in ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Aggregate functions
   */
  async aggregate(
    fields: { field: keyof T | string; function: 'sum' | 'avg' | 'min' | 'max' | 'count' }[],
    options?: QueryOptions<T>
  ): Promise<AggregationResult> {
    try {
      const selectFields = fields.map(
        f => `${f.function}(${String(f.field)}) as ${f.function}_${String(f.field)}`
      );

      let query = `SELECT ${selectFields.join(', ')} FROM ${this.tableName}`;
      let params: Record<string, unknown> = {};

      if (options?.where && options.where.length > 0) {
        const builder = new ClickHouseQueryBuilder<T>(this.tableName);
        
        options.where.forEach((condition, index) => {
          if (index === 0) {
            builder.where(condition.field, condition.operator, condition.value);
          } else {
            builder.andWhere(condition.field, condition.operator, condition.value);
          }
        });

        const fullSQL = builder.toSQL();
        const whereMatch = fullSQL.match(/WHERE (.+?)(?:GROUP BY|ORDER BY|LIMIT|$)/);
        if (whereMatch) {
          query += ` WHERE ${whereMatch[1]}`;
          params = builder.getParams();
        }
      }

      const result = await clickHouseClient.query<AggregationResult>(query, params);
      return result.length > 0 ? result[0] : {};
    } catch (error) {
      console.error(`Error aggregating in ${this.tableName}:`, error);
      throw error;
    }
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Check if record exists
   */
  async exists(options: QueryOptions<T>): Promise<boolean> {
    const count = await this.count(options);
    return count > 0;
  }

  /**
   * Get distinct values
   */
  async getDistinct(field: keyof T | string, options?: QueryOptions<T>): Promise<Array<Record<string, unknown>>> {
    try {
      let query = `SELECT DISTINCT ${String(field)} FROM ${this.tableName}`;
      let params: Record<string, unknown> = {};

      if (options?.where && options.where.length > 0) {
        const builder = new ClickHouseQueryBuilder<T>(this.tableName);
        
        options.where.forEach((condition, index) => {
          if (index === 0) {
            builder.where(condition.field, condition.operator, condition.value);
          } else {
            builder.andWhere(condition.field, condition.operator, condition.value);
          }
        });

        const fullSQL = builder.toSQL();
        const whereMatch = fullSQL.match(/WHERE (.+?)(?:GROUP BY|ORDER BY|LIMIT|$)/);
        if (whereMatch) {
          query += ` WHERE ${whereMatch[1]}`;
          params = builder.getParams();
        }
      }

      query += ` ORDER BY ${String(field)}`;

      const result = await clickHouseClient.query<Record<string, unknown>>(query, params);
      // Cast to proper type since query returns unknown[]
      return result as unknown as Array<Record<string, unknown>>;
    } catch (error) {
      console.error(`Error getting distinct in ${this.tableName}:`, error);
      throw error;
    }
  }

  // ============================================
  // Raw Query Execution
  // ============================================

  /**
   * Execute raw query
   */
  protected async executeRawQuery<R = unknown>(
    query: string,
    params?: Record<string, unknown>
  ): Promise<R[]> {
    return await clickHouseClient.query<R>(query, params);
  }

  /**
   * Execute raw query (single result)
   */
  protected async executeRawQueryOne<R = unknown>(
    query: string,
    params?: Record<string, unknown>
  ): Promise<R | null> {
    return await clickHouseClient.queryOne<R>(query, params);
  }
}
