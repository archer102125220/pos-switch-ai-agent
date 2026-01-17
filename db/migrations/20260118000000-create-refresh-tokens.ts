import { QueryInterface, Sequelize, DataTypes } from 'sequelize';

/**
 * Migration to create refresh_tokens table for token revocation support
 */

export async function up(queryInterface: QueryInterface, _Sequelize: typeof Sequelize): Promise<void> {
  await queryInterface.createTable('refresh_tokens', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    jti: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: _Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });

  // Index for lookup by jti
  await queryInterface.addIndex('refresh_tokens', ['jti'], {
    name: 'refresh_tokens_jti_idx',
  });

  // Index for cleanup of expired tokens
  await queryInterface.addIndex('refresh_tokens', ['expires_at'], {
    name: 'refresh_tokens_expires_at_idx',
  });

  // Index for user's tokens lookup
  await queryInterface.addIndex('refresh_tokens', ['user_id'], {
    name: 'refresh_tokens_user_id_idx',
  });
}

export async function down(queryInterface: QueryInterface, _Sequelize: typeof Sequelize): Promise<void> {
  await queryInterface.dropTable('refresh_tokens');
}
