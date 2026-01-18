import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database';

interface RoleAttributes {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type RoleCreationAttributes = Optional<RoleAttributes, 'id' | 'description' | 'isActive' | 'createdAt' | 'updatedAt'>;

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'roles',
    timestamps: true,
    underscored: true,
  }
);

export default Role;
export type { RoleAttributes, RoleCreationAttributes };
