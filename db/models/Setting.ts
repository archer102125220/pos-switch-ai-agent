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

interface SettingCreationAttributes extends Optional<SettingAttributes, 'id' | 'storeId' | 'createdAt' | 'updatedAt'> {}

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
      references: {
        model: 'stores',
        key: 'id',
      },
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
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
