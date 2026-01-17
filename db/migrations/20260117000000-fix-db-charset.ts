import { QueryInterface, Sequelize } from 'sequelize';

/**
 * Migration to ensure database charset is utf8mb4
 * This provides defense-in-depth for proper Unicode support including emojis
 */

export async function up(queryInterface: QueryInterface, _Sequelize: typeof Sequelize): Promise<void> {
  const config = queryInterface.sequelize.config;
  const options = queryInterface.sequelize.options;
  const database = config.database;
  const dialect = options.dialect || config.dialect;
  
  if (dialect === 'mysql') {
    const charset = 'utf8mb4';
    const collate = 'utf8mb4_unicode_ci';
    
    // Alter database default charset
    await queryInterface.sequelize.query(
      `ALTER DATABASE \`${database}\` CHARACTER SET ${charset} COLLATE ${collate};`
    );
    
    console.log(`✅ Database "${database}" charset set to ${charset}/${collate}`);
  } else {
    console.log(`ℹ️ Charset migration skipped (dialect: ${dialect})`);
  }
}

export async function down(_queryInterface: QueryInterface, _Sequelize: typeof Sequelize): Promise<void> {
  // Reverting charset is generally not recommended
  // as it could cause data loss with special characters
  console.log('ℹ️ Charset revert skipped (not recommended)');
}
