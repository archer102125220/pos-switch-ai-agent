import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database';

type OrderStatus = 'draft' | 'in_progress' | 'pending' | 'completed' | 'cancelled' | 'refunded';
type CheckoutMode = 'pre_pay' | 'post_pay';

interface OrderAttributes {
  id: number;
  orderNumber: string;
  storeId: number | null;
  userId: number | null;
  tableNumber: string | null;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  checkoutMode: CheckoutMode;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type OrderCreationAttributes = Optional<OrderAttributes, 'id' | 'storeId' | 'userId' | 'tableNumber' | 'tax' | 'discount' | 'status' | 'checkoutMode' | 'notes' | 'createdAt' | 'updatedAt'>;

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public orderNumber!: string;
  public storeId!: number | null;
  public userId!: number | null;
  public tableNumber!: string | null;
  public subtotal!: number;
  public tax!: number;
  public discount!: number;
  public total!: number;
  public status!: OrderStatus;
  public checkoutMode!: CheckoutMode;
  public notes!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    storeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'stores',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    tableNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'in_progress', 'pending', 'completed', 'cancelled', 'refunded'),
      allowNull: false,
      defaultValue: 'draft',
    },
    checkoutMode: {
      type: DataTypes.ENUM('pre_pay', 'post_pay'),
      allowNull: false,
      defaultValue: 'pre_pay',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'orders',
    timestamps: true,
    underscored: true,
  }
);

export default Order;
export type { OrderAttributes, OrderCreationAttributes, OrderStatus, CheckoutMode };
