import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

// Import all models
import Permission from './Permission';
import Role from './Role';
import Store from './Store';
import User from './User';
import Category from './Category';
import Product from './Product';
import Order from './Order';
import OrderItem from './OrderItem';
import Payment from './Payment';
import Setting from './Setting';
import { RefreshToken } from './RefreshToken';

// Import new customization models
import OptionGroup from './OptionGroup';
import Option from './Option';
import Addon from './Addon';
import Combo from './Combo';
import ComboGroup from './ComboGroup';
import ComboGroupItem from './ComboGroupItem';
import ProductOptionGroup from './ProductOptionGroup';
import ProductAddon from './ProductAddon';
import OrderItemOption from './OrderItemOption';
import OrderItemAddon from './OrderItemAddon';
import OrderCombo from './OrderCombo';
import OrderComboSelection from './OrderComboSelection';

// RolePermission Junction Table (Many-to-Many)
class RolePermission extends Model {}

RolePermission.init(
  {
    roleId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'roles',
        key: 'id',
      },
    },
    permissionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'permissions',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'role_permissions',
    timestamps: false,
    underscored: true,
  }
);

// ==================== Define Associations ====================

// Role <-> Permission (Many-to-Many)
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'roleId',
  otherKey: 'permissionId',
  as: 'permissions',
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permissionId',
  otherKey: 'roleId',
  as: 'roles',
});

// User -> Role (Many-to-One)
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

// User -> Store (Many-to-One)
User.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });
Store.hasMany(User, { foreignKey: 'storeId', as: 'users' });

// Product -> Category (Many-to-One)
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

// Combo -> Category (Many-to-One)
Combo.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Combo, { foreignKey: 'categoryId', as: 'combos' });

// ==================== Option Groups & Options ====================

// Option -> OptionGroup (Many-to-One)
Option.belongsTo(OptionGroup, { foreignKey: 'optionGroupId', as: 'optionGroup' });
OptionGroup.hasMany(Option, { foreignKey: 'optionGroupId', as: 'options' });

// Product <-> OptionGroup (Many-to-Many via ProductOptionGroup)
Product.belongsToMany(OptionGroup, {
  through: ProductOptionGroup,
  foreignKey: 'productId',
  otherKey: 'optionGroupId',
  as: 'optionGroups',
});
OptionGroup.belongsToMany(Product, {
  through: ProductOptionGroup,
  foreignKey: 'optionGroupId',
  otherKey: 'productId',
  as: 'products',
});

// Product <-> Addon (Many-to-Many via ProductAddon)
Product.belongsToMany(Addon, {
  through: ProductAddon,
  foreignKey: 'productId',
  otherKey: 'addonId',
  as: 'addons',
});
Addon.belongsToMany(Product, {
  through: ProductAddon,
  foreignKey: 'addonId',
  otherKey: 'productId',
  as: 'products',
});

// ==================== Combos ====================

// ComboGroup -> Combo (Many-to-One)
ComboGroup.belongsTo(Combo, { foreignKey: 'comboId', as: 'combo' });
Combo.hasMany(ComboGroup, { foreignKey: 'comboId', as: 'groups' });

// ComboGroupItem -> ComboGroup (Many-to-One)
ComboGroupItem.belongsTo(ComboGroup, { foreignKey: 'comboGroupId', as: 'comboGroup' });
ComboGroup.hasMany(ComboGroupItem, { foreignKey: 'comboGroupId', as: 'items' });

// ComboGroupItem -> Product (Many-to-One)
ComboGroupItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(ComboGroupItem, { foreignKey: 'productId', as: 'comboGroupItems' });

// ==================== Orders ====================

// Order -> Store (Many-to-One)
Order.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });
Store.hasMany(Order, { foreignKey: 'storeId', as: 'orders' });

// Order -> User (Many-to-One)
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });

// OrderItem -> Order (Many-to-One)
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });

// OrderItem -> Product (Many-to-One)
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });

// OrderItemOption -> OrderItem (Many-to-One)
OrderItemOption.belongsTo(OrderItem, { foreignKey: 'orderItemId', as: 'orderItem' });
OrderItem.hasMany(OrderItemOption, { foreignKey: 'orderItemId', as: 'options' });

// OrderItemOption -> Option (Many-to-One)
OrderItemOption.belongsTo(Option, { foreignKey: 'optionId', as: 'option' });
Option.hasMany(OrderItemOption, { foreignKey: 'optionId', as: 'orderItemOptions' });

// OrderItemAddon -> OrderItem (Many-to-One)
OrderItemAddon.belongsTo(OrderItem, { foreignKey: 'orderItemId', as: 'orderItem' });
OrderItem.hasMany(OrderItemAddon, { foreignKey: 'orderItemId', as: 'addons' });

// OrderItemAddon -> Addon (Many-to-One)
OrderItemAddon.belongsTo(Addon, { foreignKey: 'addonId', as: 'addon' });
Addon.hasMany(OrderItemAddon, { foreignKey: 'addonId', as: 'orderItemAddons' });

// OrderCombo -> Order (Many-to-One)
OrderCombo.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasMany(OrderCombo, { foreignKey: 'orderId', as: 'combos' });

// OrderCombo -> Combo (Many-to-One)
OrderCombo.belongsTo(Combo, { foreignKey: 'comboId', as: 'combo' });
Combo.hasMany(OrderCombo, { foreignKey: 'comboId', as: 'orderCombos' });

// OrderComboSelection -> OrderCombo (Many-to-One)
OrderComboSelection.belongsTo(OrderCombo, { foreignKey: 'orderComboId', as: 'orderCombo' });
OrderCombo.hasMany(OrderComboSelection, { foreignKey: 'orderComboId', as: 'selections' });

// OrderComboSelection -> ComboGroup (Many-to-One)
OrderComboSelection.belongsTo(ComboGroup, { foreignKey: 'comboGroupId', as: 'comboGroup' });
ComboGroup.hasMany(OrderComboSelection, { foreignKey: 'comboGroupId', as: 'orderSelections' });

// OrderComboSelection -> Product (Many-to-One)
OrderComboSelection.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(OrderComboSelection, { foreignKey: 'productId', as: 'orderComboSelections' });

// Payment -> Order (Many-to-One)
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasMany(Payment, { foreignKey: 'orderId', as: 'payments' });

// Setting -> Store (Many-to-One)
Setting.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });
Store.hasMany(Setting, { foreignKey: 'storeId', as: 'settings' });

// RefreshToken -> User (Many-to-One)
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });

// Export all models
export {
  sequelize,
  Permission,
  Role,
  RolePermission,
  Store,
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Payment,
  Setting,
  RefreshToken,
  // New customization models
  OptionGroup,
  Option,
  Addon,
  Combo,
  ComboGroup,
  ComboGroupItem,
  ProductOptionGroup,
  ProductAddon,
  OrderItemOption,
  OrderItemAddon,
  OrderCombo,
  OrderComboSelection,
};

// Export types
export type { PermissionAttributes, PermissionCreationAttributes } from './Permission';
export type { RoleAttributes, RoleCreationAttributes } from './Role';
export type { StoreAttributes, StoreCreationAttributes } from './Store';
export type { UserAttributes, UserCreationAttributes } from './User';
export type { CategoryAttributes, CategoryCreationAttributes } from './Category';
export type { ProductAttributes, ProductCreationAttributes } from './Product';
export type { OrderAttributes, OrderCreationAttributes, OrderStatus, CheckoutMode } from './Order';
export type { OrderItemAttributes, OrderItemCreationAttributes } from './OrderItem';
export type { PaymentAttributes, PaymentCreationAttributes, PaymentMethod, PaymentStatus } from './Payment';
export type { SettingAttributes, SettingCreationAttributes } from './Setting';
export type { RefreshTokenCreationAttributes } from './RefreshToken';
// New types
export type { OptionGroupAttributes, OptionGroupCreationAttributes } from './OptionGroup';
export type { OptionAttributes, OptionCreationAttributes } from './Option';
export type { AddonAttributes, AddonCreationAttributes } from './Addon';
export type { ComboAttributes, ComboCreationAttributes } from './Combo';
export type { ComboGroupAttributes, ComboGroupCreationAttributes } from './ComboGroup';
export type { ComboGroupItemAttributes, ComboGroupItemCreationAttributes } from './ComboGroupItem';
export type { ProductOptionGroupAttributes, ProductOptionGroupCreationAttributes } from './ProductOptionGroup';
export type { ProductAddonAttributes, ProductAddonCreationAttributes } from './ProductAddon';
export type { OrderItemOptionAttributes, OrderItemOptionCreationAttributes } from './OrderItemOption';
export type { OrderItemAddonAttributes, OrderItemAddonCreationAttributes } from './OrderItemAddon';
export type { OrderComboAttributes, OrderComboCreationAttributes } from './OrderCombo';
export type { OrderComboSelectionAttributes, OrderComboSelectionCreationAttributes } from './OrderComboSelection';
