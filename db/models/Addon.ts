import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database';

interface AddonAttributes {
  id: number;
  name: string;
  price: number;
  stock: number | null;
  trackStock: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type AddonCreationAttributes = Optional<
  AddonAttributes,
  'id' | 'stock' | 'trackStock' | 'sortOrder' | 'isActive' | 'createdAt' | 'updatedAt'
>;

class Addon extends Model<AddonAttributes, AddonCreationAttributes>
  implements AddonAttributes {
  declare id: number;
  declare name: string;
  declare price: number;
  declare stock: number | null;
  declare trackStock: boolean;
  declare sortOrder: number;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Addon.init(
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
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    trackStock: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'track_stock',
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
    tableName: 'addons',
    timestamps: true,
    underscored: true,
  }
);

export default Addon;
export type { AddonAttributes, AddonCreationAttributes };
