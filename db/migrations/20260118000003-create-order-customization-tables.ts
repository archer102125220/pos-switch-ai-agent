import { QueryInterface, Sequelize, DataTypes } from 'sequelize';

/**
 * Migration to create order customization tables
 * (order_item_options, order_item_addons, order_combos, order_combo_selections)
 */

export async function up(queryInterface: QueryInterface, _Sequelize: typeof Sequelize): Promise<void> {
  // 1. Create order_item_options table
  await queryInterface.createTable('order_item_options', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'order_items',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    option_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'options',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    option_group_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    option_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    price_adjustment: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: _Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });

  // 2. Create order_item_addons table
  await queryInterface.createTable('order_item_addons', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'order_items',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    addon_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'addons',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    addon_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: _Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });

  // 3. Create order_combos table
  await queryInterface.createTable('order_combos', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    combo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'combos',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    combo_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: _Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: _Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
    },
  });

  // 4. Create order_combo_selections table
  await queryInterface.createTable('order_combo_selections', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_combo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'order_combos',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    combo_group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'combo_groups',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    group_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    product_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    price_adjustment: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: _Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });
}

export async function down(queryInterface: QueryInterface, _Sequelize: typeof Sequelize): Promise<void> {
  await queryInterface.dropTable('order_combo_selections');
  await queryInterface.dropTable('order_combos');
  await queryInterface.dropTable('order_item_addons');
  await queryInterface.dropTable('order_item_options');
}
