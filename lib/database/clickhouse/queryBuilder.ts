/**
 * Generic Query Builder for ClickHouse
 * Database-agnostic query construction
 */

import type {
  QueryOperator,
  SortDirection,
  WhereCondition,
  OrderByClause,
  QueryOptions,
  IQueryBuilder,
} from '../types/database.types';

// ============================================
// Query Builder Implementation
// ============================================

export class ClickHouseQueryBuilder<T> implements IQueryBuilder<T> {
  private tableName: string;
  private selectFields: string[] = ['*'];
  private whereConditions: WhereCondition<T>[] = [];
  private orderByFields: OrderByClause<T>[] = [];
  private groupByFields: string[] = [];
  private havingConditions: WhereCondition<T>[] = [];
  private limitValue?: number;
  private offsetValue?: number;
  private params: Record<string, unknown> = {};
  private paramCounter = 0;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // ============================================
  // SELECT
  // ============================================

  select(...fields: (keyof T | string)[]): this {
    this.selectFields = fields.map(f => String(f));
    return this;
  }

  // ============================================
  // WHERE
  // ============================================

  where(field: keyof T | string, operator: QueryOperator, value: unknown): this {
    this.whereConditions = [{
      field: String(field),
      operator,
      value,
    }];
    return this;
  }

  andWhere(field: keyof T | string, operator: QueryOperator, value: unknown): this {
    this.whereConditions.push({
      field: String(field),
      operator,
      value,
    });
    return this;
  }

  orWhere(field: keyof T | string, operator: QueryOperator, value: unknown): this {
    // ClickHouse doesn't support OR in WHERE elegantly
    // This would need to be handled with OR concatenation
    console.warn('OR conditions not fully optimized in ClickHouse');
    this.whereConditions.push({
      field: String(field),
      operator,
      value,
    });
    return this;
  }

  // ============================================
  // ORDER BY
  // ============================================

  orderBy(field: keyof T | string, direction: SortDirection = 'asc'): this {
    this.orderByFields.push({
      field: String(field),
      direction,
    });
    return this;
  }

  // ============================================
  // GROUP BY
  // ============================================

  groupBy(...fields: (keyof T | string)[]): this {
    this.groupByFields = fields.map(f => String(f));
    return this;
  }

  having(field: keyof T | string, operator: QueryOperator, value: unknown): this {
    this.havingConditions.push({
      field: String(field),
      operator,
      value,
    });
    return this;
  }

  // ============================================
  // PAGINATION
  // ============================================

  limit(count: number): this {
    this.limitValue = count;
    return this;
  }

  offset(count: number): this {
    this.offsetValue = count;
    return this;
  }

  // ============================================
  // SQL GENERATION
  // ============================================

  private buildWhereClause(conditions: WhereCondition<T>[]): string {
    if (conditions.length === 0) return '';

    const clauses = conditions.map((condition) => {
      const paramName = this.addParam(condition.value);
      const field = condition.field as string;

      switch (condition.operator) {
        case 'eq':
          return `${field} = {${paramName}: ${this.getClickHouseType(condition.value)}}`;
        case 'neq':
          return `${field} != {${paramName}: ${this.getClickHouseType(condition.value)}}`;
        case 'gt':
          return `${field} > {${paramName}: ${this.getClickHouseType(condition.value)}}`;
        case 'gte':
          return `${field} >= {${paramName}: ${this.getClickHouseType(condition.value)}}`;
        case 'lt':
          return `${field} < {${paramName}: ${this.getClickHouseType(condition.value)}}`;
        case 'lte':
          return `${field} <= {${paramName}: ${this.getClickHouseType(condition.value)}}`;
        case 'in':
          return `${field} IN {${paramName}: Array(${this.getClickHouseType((condition.value as unknown[])[0])})}`;
        case 'nin':
          return `${field} NOT IN {${paramName}: Array(${this.getClickHouseType((condition.value as unknown[])[0])})}`;
        case 'like':
          return `${field} LIKE {${paramName}: String}`;
        case 'ilike':
          return `lower(${field}) LIKE lower({${paramName}: String})`;
        case 'between':
          const paramName2 = this.addParam((condition.value as unknown[])[1]);
          return `${field} BETWEEN {${paramName}: ${this.getClickHouseType((condition.value as unknown[])[0])}} AND {${paramName2}: ${this.getClickHouseType((condition.value as unknown[])[1])}}`;
        default:
          throw new Error(`Unsupported operator: ${condition.operator}`);
      }
    });

    return clauses.join(' AND ');
  }

  private getClickHouseType(value: unknown): string {
    if (typeof value === 'string') return 'String';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'Int64' : 'Float64';
    }
    if (typeof value === 'boolean') return 'UInt8';
    if (value instanceof Date) return 'DateTime';
    if (Array.isArray(value) && value.length > 0) {
      return this.getClickHouseType(value[0]);
    }
    return 'String';
  }

  private addParam(value: unknown): string {
    const paramName = `param_${this.paramCounter++}`;
    this.params[paramName] = value;
    return paramName;
  }

  toSQL(): string {
    let sql = `SELECT ${this.selectFields.join(', ')} FROM ${this.tableName}`;

    // WHERE
    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.buildWhereClause(this.whereConditions)}`;
    }

    // GROUP BY
    if (this.groupByFields.length > 0) {
      sql += ` GROUP BY ${this.groupByFields.join(', ')}`;
    }

    // HAVING
    if (this.havingConditions.length > 0) {
      sql += ` HAVING ${this.buildWhereClause(this.havingConditions)}`;
    }

    // ORDER BY
    if (this.orderByFields.length > 0) {
      const orderClauses = this.orderByFields.map(
        (o) => `${String(o.field)} ${o.direction.toUpperCase()}`
      );
      sql += ` ORDER BY ${orderClauses.join(', ')}`;
    }

    // LIMIT
    if (this.limitValue) {
      sql += ` LIMIT ${this.limitValue}`;
    }

    // OFFSET
    if (this.offsetValue) {
      sql += ` OFFSET ${this.offsetValue}`;
    }

    return sql;
  }

  getParams(): Record<string, unknown> {
    return this.params;
  }

  // ============================================
  // EXECUTION (to be implemented with client)
  // ============================================

  async execute(): Promise<T[]> {
    throw new Error('Execute must be implemented in repository');
  }

  async executeOne(): Promise<T | null> {
    throw new Error('ExecuteOne must be implemented in repository');
  }

  async executeCount(): Promise<number> {
    throw new Error('ExecuteCount must be implemented in repository');
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Parse odds filter string (">2.5", "<1.8", "1.75", "1.5-2.5")
 */
export function parseOddsFilter(filterValue: string): {
  operator: QueryOperator;
  value: number | number[];
} | null {
  if (!filterValue) return null;

  const trimmed = filterValue.trim();

  // Between: "1.5-2.5"
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-').map(p => parseFloat(p.trim()));
    if (parts.length === 2 && !parts.some(isNaN)) {
      return { operator: 'between', value: parts };
    }
  }

  // Greater than: ">2.5"
  if (trimmed.startsWith('>')) {
    const val = parseFloat(trimmed.substring(1));
    return !isNaN(val) ? { operator: 'gt', value: val } : null;
  }

  // Less than: "<1.8"
  if (trimmed.startsWith('<')) {
    const val = parseFloat(trimmed.substring(1));
    return !isNaN(val) ? { operator: 'lt', value: val } : null;
  }

  // Equal: "1.75"
  const val = parseFloat(trimmed);
  return !isNaN(val) ? { operator: 'eq', value: val } : null;
}

/**
 * Build dynamic WHERE clauses from QueryOptions
 */
export function buildWhereFromOptions<T>(
  options: QueryOptions<T>
): WhereCondition<T>[] {
  return options.where || [];
}

/**
 * Build ORDER BY from QueryOptions
 */
export function buildOrderByFromOptions<T>(
  options: QueryOptions<T>
): OrderByClause<T>[] {
  return options.orderBy || [];
}

/**
 * Calculate pagination offset
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Calculate total pages
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}
