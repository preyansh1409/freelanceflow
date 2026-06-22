const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const runMigrations = async () => {
  try {
    console.log('🔄 Starting database migrations...');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.warn('⚠️ No schema.sql file found at:', schemaPath);
      return;
    }

    const sqlContent = fs.readFileSync(schemaPath, 'utf8');
    const lines = sqlContent.split('\n');

    // Filter out comments, empty lines, and database creation/usage commands
    const cleanLines = lines.filter(line => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (trimmed.startsWith('--')) return false;
      if (trimmed.toUpperCase().startsWith('CREATE DATABASE')) return false;
      if (trimmed.toUpperCase().startsWith('USE ')) return false;
      return true;
    });

    const cleanSql = cleanLines.join('\n');
    
    // Split by semicolon, filter out empty/non-DDL statements
    const statements = cleanSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        const upper = stmt.toUpperCase();
        return upper.startsWith('CREATE TABLE') || upper.startsWith('ALTER TABLE') || upper.startsWith('INSERT INTO');
      });

    console.log(`📋 Found ${statements.length} table/structure SQL statements to execute.`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const firstLine = stmt.split('\n')[0].trim();
      console.log(`🚀 Executing statement ${i + 1}/${statements.length}: "${firstLine}..."`);
      try {
        await db.query(stmt);
      } catch (err) {
        console.error(`❌ Error executing statement ${i + 1}:`, err.message);
        console.error('Statement was:', stmt);
        throw err;
      }
    }

    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    throw error;
  }
};

module.exports = { runMigrations };
