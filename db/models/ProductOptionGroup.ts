import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database';

interface ProductOptionGroupAttributes {
  id: number;
  productId: number;
  optionGroupId: number;
  isRequired: boolean;
  sortOrder: number;
}

type ProductOptionGroupCreationAttributes = Optional<
  ProductOptionGroupAttributes,
  'id' | 'isRequired' | 'sortOrder'
>;

class ProductOptionGroup extends Model<ProductOptionGroupAttributes, ProductOptionGroupCreationAttributes>
  implements ProductOptionGroupAttributes {
  declare id: number;
  declare productId: number;
  declare optionGroupId: number;
  declare isRequired: boolean;
  declare sortOrder: number;
}

ProductOptionGroup.init(
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
    optionGroupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'option_group_id',
      references: {
        model: 'option_groups',
        key: 'id',
      },
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_required',
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
    tableName: 'product_option_groups',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['product_id', 'option_group_id'],
      },
    ],
  }
);

export default ProductOptionGroup;
export type { ProductOptionGroupAttributes, ProductOptionGroupCreationAttributes };
