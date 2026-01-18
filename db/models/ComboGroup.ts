import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database';

interface ComboGroupAttributes {
  id: number;
  comboId: number;
  name: string;
  description: string | null;
  selectionType: 'single' | 'multiple';
  minSelections: number;
  maxSelections: number;
  isRequired: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

type ComboGroupCreationAttributes = Optional<
  ComboGroupAttributes,
  'id' | 'description' | 'selectionType' | 'minSelections' | 'maxSelections' | 'isRequired' | 'sortOrder' | 'createdAt' | 'updatedAt'
>;

class ComboGroup extends Model<ComboGroupAttributes, ComboGroupCreationAttributes>
  implements ComboGroupAttributes {
  declare id: number;
  declare comboId: number;
  declare name: string;
  declare description: string | null;
  declare selectionType: 'single' | 'multiple';
  declare minSelections: number;
  declare maxSelections: number;
  declare isRequired: boolean;
  declare sortOrder: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ComboGroup.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    comboId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'combo_id',
      references: {
        model: 'combos',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    selectionType: {
      type: DataTypes.ENUM('single', 'multiple'),
      allowNull: false,
      defaultValue: 'single',
      field: 'selection_type',
    },
    minSelections: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'min_selections',
    },
    maxSelections: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'max_selections',
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_required',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order',
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
    tableName: 'combo_groups',
    timestamps: true,
    underscored: true,
  }
);

export default ComboGroup;
export type { ComboGroupAttributes, ComboGroupCreationAttributes };
