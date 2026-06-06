const db = require('../config/db');

const VALID_TABLES = [
  'gyms', 'users', 'sessions', 'members', 'leads', 'payments', 'attendance', 'audit_logs', 'schema_migrations'
];

const SOFT_DELETE_TABLES = ['users', 'members', 'leads'];

/**
 * BaseRepository enforces the Sacred Tenant Isolation Rule.
 * Controllers/Services MUST NEVER query the database directly.
 */
class BaseRepository {
  constructor(tableName) {
    if (!VALID_TABLES.includes(tableName)) {
      throw new Error(`CRITICAL SECURITY VIOLATION: Attempted to initialize BaseRepository with invalid table name: ${tableName}`);
    }
    this.tableName = tableName;
    this.hasSoftDelete = SOFT_DELETE_TABLES.includes(tableName);
  }

  // Helper to ensure we don't accidentally run queries without gym_id
  _validateGymId(gymId) {
    if (!gymId) {
      throw new Error(`CRITICAL TENANT VIOLATION: gymId missing for table ${this.tableName}`);
    }
  }

  _getSoftDeleteClause(prefix = '') {
    return this.hasSoftDelete ? ` AND ${prefix}deleted_at IS NULL` : '';
  }

  async findById(gymId, id) {
    this._validateGymId(gymId);
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1 AND gym_id = $2${this._getSoftDeleteClause()} LIMIT 1`;
    const result = await db.query(query, [id, gymId]);
    return result.rows[0];
  }

  async findAll(gymId, limit = 100, offset = 0) {
    this._validateGymId(gymId);
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE gym_id = $1${this._getSoftDeleteClause()} 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [gymId, limit, offset]);
    return result.rows;
  }

  async create(gymId, data) {
    this._validateGymId(gymId);
    
    // Auto-inject gym_id
    const payload = { ...data, gym_id: gymId };
    
    const columns = Object.keys(payload);
    const values = Object.values(payload);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO ${this.tableName} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  async update(gymId, id, data) {
    this._validateGymId(gymId);
    
    // SECURITY FIX: Sanitize incoming data to mathematically prevent tenant reassignment or immutable field manipulation
    const safeData = { ...data };
    delete safeData.gym_id;
    delete safeData.id;
    delete safeData.created_at;
    delete safeData.updated_at;
    delete safeData.deleted_at;
    
    const columns = Object.keys(safeData);
    if (columns.length === 0) {
        throw new Error('No valid fields to update');
    }
    
    const values = Object.values(safeData);
    
    // Build 'col1 = $1, col2 = $2'
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    
    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${columns.length + 1} AND gym_id = $${columns.length + 2}${this._getSoftDeleteClause()}
      RETURNING *
    `;

    const result = await db.query(query, [...values, id, gymId]);
    return result.rows[0];
  }

  async softDelete(gymId, id) {
    this._validateGymId(gymId);
    if (!this.hasSoftDelete) {
        throw new Error(`CRITICAL: Attempted to soft-delete on table without deleted_at column: ${this.tableName}`);
    }
    const query = `
      UPDATE ${this.tableName} 
      SET deleted_at = CURRENT_TIMESTAMP 
      WHERE id = $1 AND gym_id = $2 
      RETURNING id
    `;
    const result = await db.query(query, [id, gymId]);
    return result.rows[0];
  }
}

module.exports = BaseRepository;