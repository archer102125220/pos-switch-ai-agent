import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database';

interface OrderItemOptionAttributes {
  id: number;
  orderItemId: number;
  optionId: number;
  optionGroupName: string;
  optionName: string;
  priceAdjustment: number;
  createdAt: Date;
}

type OrderItemOptionCreationAttributes = Optional<
  OrderItemOptionAttributes,
  'id' | 'priceAdjustment' | 'createdAt'
>;

class OrderItemOption extends Model<OrderItemOptionAttributes, OrderItemOptionCreationAttributes>
  implements OrderItemOptionAttributes {
  declare id: number;
  declare orderItemId: number;
  declare optionId: number;
  declare optionGroupName: string;
  declare optionName: string;
  declare priceAdjustment: number;
  declare readonly createdAt: Date;
}

OrderItemOption.init(
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
    optionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'option_id',
      references: {
        model: 'options',
        key: 'id',
      },
    },
    optionGroupName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'option_group_name',
    },
    optionName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'option_name',
    },
    priceAdjustment: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'price_adjustment',
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
    tableName: 'order_item_options',
    timestamps: false,
    underscored: true,
  }
);

export default OrderItemOption;
export type { OrderItemOptionAttributes, OrderItemOptionCreationAttributes };
