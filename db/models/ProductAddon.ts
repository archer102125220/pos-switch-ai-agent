import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database';

interface ProductAddonAttributes {
  id: number;
  productId: number;
  addonId: number;
  maxQuantity: number;
  sortOrder: number;
}

type ProductAddonCreationAttributes = Optional<
  ProductAddonAttributes,
  'id' | 'maxQuantity' | 'sortOrder'
>;

class ProductAddon extends Model<ProductAddonAttributes, ProductAddonCreationAttributes>
  implements ProductAddonAttributes {
  declare id: number;
  declare productId: number;
  declare addonId: number;
  declare maxQuantity: number;
  declare sortOrder: number;
}

ProductAddon.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    addonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'addon_id',
      references: {
        model: 'addons',
        key: 'id',
      },
    },
    maxQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 99,
      field: 'max_quantity',
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
    tableName: 'product_addons',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['product_id', 'addon_id'],
      },
    ],
  }
);

export default ProductAddon;
export type { ProductAddonAttributes, ProductAddonCreationAttributes };
