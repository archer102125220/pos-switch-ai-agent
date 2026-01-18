import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database';

interface ComboAttributes {
  id: number;
  categoryId: number | null;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type ComboCreationAttributes = Optional<
  ComboAttributes,
  'id' | 'categoryId' | 'description' | 'originalPrice' | 'imageUrl' | 'sortOrder' | 'isActive' | 'createdAt' | 'updatedAt'
>;

class Combo extends Model<ComboAttributes, ComboCreationAttributes>
  implements ComboAttributes {
  declare id: number;
  declare categoryId: number | null;
  declare name: string;
  declare description: string | null;
  declare price: number;
  declare originalPrice: number | null;
  declare imageUrl: string | null;
  declare sortOrder: number;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Combo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'category_id',
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    originalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'original_price',
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'image_url',
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
    tableName: 'combos',
    timestamps: true,
    underscored: true,
  }
);

export default Combo;
export type { ComboAttributes, ComboCreationAttributes };
