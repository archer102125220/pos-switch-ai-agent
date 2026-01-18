import { Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional, type ForeignKey } from 'sequelize';
import sequelize from '../config/database';

export class RefreshToken extends Model<InferAttributes<RefreshToken>, InferCreationAttributes<RefreshToken>> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<number>;
  declare jti: string;
  declare expiresAt: Date;
  declare revokedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;

  /**
   * Check if the token has been revoked
   */
  isRevoked(): boolean {
    return this.revokedAt !== null;
  }

  /**
   * Check if the token has expired
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Check if the token is valid (not revoked and not expired)
   */
  isValid(): boolean {
    return !this.isRevoked() && !this.isExpired();
  }
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },
    jti: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'revoked_at',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'refresh_tokens',
    timestamps: false,
    underscored: true,
  }
);

export type RefreshTokenCreationAttributes = InferCreationAttributes<RefreshToken>;
