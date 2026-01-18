import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database';

interface ComboGroupItemAttributes {
  id: number;
  comboGroupId: number;
  productId: number;
  priceAdjustment: number;
  isDefault: boolean;
  sortOrder: number;
}

type ComboGroupItemCreationAttributes = Optional<
  ComboGroupItemAttributes,
  'id' | 'priceAdjustment' | 'isDefault' | 'sortOrder'
>;

class ComboGroupItem extends Model<ComboGroupItemAttributes, ComboGroupItemCreationAttributes>
  implements ComboGroupItemAttributes {
  declare id: number;
  declare comboGroupId: number;
  declare productId: number;
  declare priceAdjustment: number;
  declare isDefault: boolean;
  declare sortOrder: number;
}

ComboGroupItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    comboGroupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'combo_group_id',
      references: {
        model: 'combo_groups',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'product_id',
      references: {
        model: 'products',
        key: 'id',
      },
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
  },
  {
    sequelize,
    tableName: 'combo_group_items',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['combo_group_id', 'product_id'],
      },
    ],
  }
);

export default ComboGroupItem;
export type { ComboGroupItemAttributes, ComboGroupItemCreationAttributes };
