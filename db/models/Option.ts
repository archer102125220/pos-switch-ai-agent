import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database';

interface OptionAttributes {
  id: number;
  optionGroupId: number;
  name: string;
  priceAdjustment: number;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type OptionCreationAttributes = Optional<
  OptionAttributes,
  'id' | 'priceAdjustment' | 'isDefault' | 'sortOrder' | 'isActive' | 'createdAt' | 'updatedAt'
>;

class Option extends Model<OptionAttributes, OptionCreationAttributes>
  implements OptionAttributes {
  declare id: number;
  declare optionGroupId: number;
  declare name: string;
  declare priceAdjustment: number;
  declare isDefault: boolean;
  declare sortOrder: number;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Option.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    optionGroupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'option_group_id',
      references: {
        model: 'option_groups',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    priceAdjustment: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'price_adjustment',
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_default',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'options',
    timestamps: true,
    underscored: true,
  }
);

export default Option;
export type { OptionAttributes, OptionCreationAttributes };
