import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database';

interface OrderItemAddonAttributes {
  id: number;
  orderItemId: number;
  addonId: number;
  addonName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  createdAt: Date;
}

type OrderItemAddonCreationAttributes = Optional<
  OrderItemAddonAttributes,
  'id' | 'quantity' | 'createdAt'
>;

class OrderItemAddon extends Model<OrderItemAddonAttributes, OrderItemAddonCreationAttributes>
  implements OrderItemAddonAttributes {
  declare id: number;
  declare orderItemId: number;
  declare addonId: number;
  declare addonName: string;
  declare unitPrice: number;
  declare quantity: number;
  declare subtotal: number;
  declare readonly createdAt: Date;
}

OrderItemAddon.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderItemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_item_id',
      references: {
        model: 'order_items',
        key: 'id',
      },
    },
    addonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'addon_id',
      references: {
        model: 'addons',
        key: 'id',
      },
    },
    addonName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'addon_name',
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'unit_price',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
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
    tableName: 'order_item_addons',
    timestamps: false,
    underscored: true,
  }
);

export default OrderItemAddon;
export type { OrderItemAddonAttributes, OrderItemAddonCreationAttributes };
