import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database';

interface OrderComboSelectionAttributes {
  id: number;
  orderComboId: number;
  comboGroupId: number;
  productId: number;
  groupName: string;
  productName: string;
  priceAdjustment: number;
  quantity: number;
  createdAt: Date;
}

type OrderComboSelectionCreationAttributes = Optional<
  OrderComboSelectionAttributes,
  'id' | 'priceAdjustment' | 'quantity' | 'createdAt'
>;

class OrderComboSelection extends Model<OrderComboSelectionAttributes, OrderComboSelectionCreationAttributes>
  implements OrderComboSelectionAttributes {
  declare id: number;
  declare orderComboId: number;
  declare comboGroupId: number;
  declare productId: number;
  declare groupName: string;
  declare productName: string;
  declare priceAdjustment: number;
  declare quantity: number;
  declare readonly createdAt: Date;
}

OrderComboSelection.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderComboId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_combo_id',
      references: {
        model: 'order_combos',
        key: 'id',
      },
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
    groupName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'group_name',
    },
    productName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'product_name',
    },
    priceAdjustment: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'price_adjustment',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'order_combo_selections',
    timestamps: false,
    underscored: true,
  }
);

export default OrderComboSelection;
export type { OrderComboSelectionAttributes, OrderComboSelectionCreationAttributes };
