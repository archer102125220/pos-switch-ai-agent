import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database';

interface PermissionAttributes {
  id: number;
  code: 'product_management' | 'checkout' | 'order_history' | 'statistics' | 'system_settings';
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type PermissionCreationAttributes = Optional<PermissionAttributes, 'id' | 'description' | 'createdAt' | 'updatedAt'>;

class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> implements PermissionAttributes {
  declare id: number;
  declare code: 'product_management' | 'checkout' | 'order_history' | 'statistics' | 'system_settings';
  declare name: string;
  declare description: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.ENUM('product_management', 'checkout', 'order_history', 'statistics', 'system_settings'),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'permissions',
    timestamps: true,
    underscored: true,
  }
);

export default Permission;
export type { PermissionAttributes, PermissionCreationAttributes };
