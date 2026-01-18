import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database';

interface OptionGroupAttributes {
  id: number;
  name: string;
  displayName: string;
  selectionType: 'single' | 'multiple';
  isRequired: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type OptionGroupCreationAttributes = Optional<
  OptionGroupAttributes,
  'id' | 'selectionType' | 'isRequired' | 'sortOrder' | 'isActive' | 'createdAt' | 'updatedAt'
>;

class OptionGroup extends Model<OptionGroupAttributes, OptionGroupCreationAttributes>
  implements OptionGroupAttributes {
  declare id: number;
  declare name: string;
  declare displayName: string;
  declare selectionType: 'single' | 'multiple';
  declare isRequired: boolean;
  declare sortOrder: number;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

OptionGroup.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    displayName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'display_name',
    },
    selectionType: {
      type: DataTypes.ENUM('single', 'multiple'),
      allowNull: false,
      defaultValue: 'single',
      field: 'selection_type',
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_required',
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
    tableName: 'option_groups',
    timestamps: true,
    underscored: true,
  }
);

export default OptionGroup;
export type { OptionGroupAttributes, OptionGroupCreationAttributes };
