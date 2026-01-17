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

// Define Associations

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
