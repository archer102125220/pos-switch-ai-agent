import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database';

interface SettingAttributes {
  id: number;
  storeId: number | null;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

type SettingCreationAttributes = Optional<SettingAttributes, 'id' | 'storeId' | 'createdAt' | 'updatedAt'>;

class Setting extends Model<SettingAttributes, SettingCreationAttributes> implements SettingAttributes {
  public id!: number;
  public storeId!: number | null;
  public key!: string;
  public value!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Setting.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    storeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'store_id', // Explicit mapping for underscored
      references: {
        model: 'stores',
        key: 'id',
      },
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'key', // Explicit mapping (same name)
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'value', // Explicit mapping (same name)
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at', // Explicit mapping for underscored
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at', // Explicit mapping for underscored
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'settings',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['store_id', 'key'],
      },
    ],
  }
);

export default Setting;
export type { SettingAttributes, SettingCreationAttributes };
