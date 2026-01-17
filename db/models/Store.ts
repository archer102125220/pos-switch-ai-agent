import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database';

interface StoreAttributes {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  taxId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type StoreCreationAttributes = Optional<StoreAttributes, 'id' | 'address' | 'phone' | 'taxId' | 'isActive' | 'createdAt' | 'updatedAt'>;

class Store extends Model<StoreAttributes, StoreCreationAttributes> implements StoreAttributes {
  public id!: number;
  public name!: string;
  public address!: string | null;
  public phone!: string | null;
  public taxId!: string | null;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Store.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    taxId: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'stores',
    timestamps: true,
    underscored: true,
  }
);

export default Store;
export type { StoreAttributes, StoreCreationAttributes };
