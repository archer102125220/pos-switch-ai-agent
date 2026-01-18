import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database';

interface OrderComboAttributes {
  id: number;
  orderId: number;
  comboId: number;
  comboName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type OrderComboCreationAttributes = Optional<
  OrderComboAttributes,
  'id' | 'quantity' | 'notes' | 'createdAt' | 'updatedAt'
>;

class OrderCombo extends Model<OrderComboAttributes, OrderComboCreationAttributes>
  implements OrderComboAttributes {
  declare id: number;
  declare orderId: number;
  declare comboId: number;
  declare comboName: string;
  declare unitPrice: number;
  declare quantity: number;
  declare subtotal: number;
  declare notes: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

OrderCombo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_id',
      references: {
        model: 'orders',
        key: 'id',
      },
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
    comboName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'combo_name',
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
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'order_combos',
    timestamps: true,
    underscored: true,
  }
);

export default OrderCombo;
export type { OrderComboAttributes, OrderComboCreationAttributes };
