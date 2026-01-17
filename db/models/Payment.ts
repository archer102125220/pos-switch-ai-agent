import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database';

type PaymentMethod = 'cash' | 'credit_card' | 'mobile_pay' | 'other';
type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

interface PaymentAttributes {
  id: number;
  orderId: number;
  method: PaymentMethod;
  amount: number;
  receivedAmount: number | null;
  change: number | null;
  transactionId: string | null;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'receivedAmount' | 'change' | 'transactionId' | 'status' | 'createdAt' | 'updatedAt'> {}

class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id!: number;
  public orderId!: number;
  public method!: PaymentMethod;
  public amount!: number;
  public receivedAmount!: number | null;
  public change!: number | null;
  public transactionId!: string | null;
  public status!: PaymentStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    method: {
      type: DataTypes.ENUM('cash', 'credit_card', 'mobile_pay', 'other'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    receivedAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    change: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    transactionId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
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
    tableName: 'payments',
    timestamps: true,
    underscored: true,
  }
);

export default Payment;
export type { PaymentAttributes, PaymentCreationAttributes, PaymentMethod, PaymentStatus };
