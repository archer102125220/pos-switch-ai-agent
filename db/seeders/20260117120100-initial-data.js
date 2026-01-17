'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Seed Permissions
    await queryInterface.bulkInsert('permissions', [
      { code: 'product_management', name: '品項維護', description: '新增/編輯/刪除商品與分類', created_at: now, updated_at: now },
      { code: 'checkout', name: '結帳', description: '操作 POS 結帳功能', created_at: now, updated_at: now },
      { code: 'order_history', name: '歷史訂單查詢', description: '檢視過往訂單記錄', created_at: now, updated_at: now },
      { code: 'statistics', name: '統計資料閱覽', description: '檢視銷售報表與統計', created_at: now, updated_at: now },
    ]);

    // Get permission IDs
    const permissions = await queryInterface.sequelize.query(
      'SELECT id, code FROM permissions',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const permissionMap = {};
    permissions.forEach(p => { permissionMap[p.code] = p.id; });

    // Seed Roles
    await queryInterface.bulkInsert('roles', [
      { name: 'Admin', description: '管理員 - 擁有所有權限', is_active: true, created_at: now, updated_at: now },
      { name: 'Manager', description: '店長 - 擁有所有權限', is_active: true, created_at: now, updated_at: now },
      { name: 'Cashier', description: '收銀員 - 結帳與訂單查詢', is_active: true, created_at: now, updated_at: now },
      { name: 'Auditor', description: '查帳員 - 訂單查詢與統計', is_active: true, created_at: now, updated_at: now },
    ]);

    // Get role IDs
    const roles = await queryInterface.sequelize.query(
      'SELECT id, name FROM roles',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const roleMap = {};
    roles.forEach(r => { roleMap[r.name] = r.id; });

    // Seed RolePermissions
    await queryInterface.bulkInsert('role_permissions', [
      // Admin: all permissions
      { role_id: roleMap['Admin'], permission_id: permissionMap['product_management'] },
      { role_id: roleMap['Admin'], permission_id: permissionMap['checkout'] },
      { role_id: roleMap['Admin'], permission_id: permissionMap['order_history'] },
      { role_id: roleMap['Admin'], permission_id: permissionMap['statistics'] },
      // Manager: all permissions
      { role_id: roleMap['Manager'], permission_id: permissionMap['product_management'] },
      { role_id: roleMap['Manager'], permission_id: permissionMap['checkout'] },
      { role_id: roleMap['Manager'], permission_id: permissionMap['order_history'] },
      { role_id: roleMap['Manager'], permission_id: permissionMap['statistics'] },
      // Cashier: checkout, order_history
      { role_id: roleMap['Cashier'], permission_id: permissionMap['checkout'] },
      { role_id: roleMap['Cashier'], permission_id: permissionMap['order_history'] },
      // Auditor: order_history, statistics
      { role_id: roleMap['Auditor'], permission_id: permissionMap['order_history'] },
      { role_id: roleMap['Auditor'], permission_id: permissionMap['statistics'] },
    ]);

    // Seed Default Store
    await queryInterface.bulkInsert('stores', [
      { name: '總店', address: '台北市', phone: '02-1234-5678', is_active: true, created_at: now, updated_at: now },
    ]);

    // Get store ID
    const stores = await queryInterface.sequelize.query(
      'SELECT id FROM stores LIMIT 1',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const storeId = stores[0].id;

    // Seed Default Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await queryInterface.bulkInsert('users', [
      {
        store_id: storeId,
        role_id: roleMap['Admin'],
        email: 'admin@pos-switch.com',
        password_hash: hashedPassword,
        name: '系統管理員',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    // Seed Default Categories
    await queryInterface.bulkInsert('categories', [
      { name: '飲料', description: '各式飲品', sort_order: 1, is_active: true, created_at: now, updated_at: now },
      { name: '餐點', description: '正餐、輕食', sort_order: 2, is_active: true, created_at: now, updated_at: now },
      { name: '點心', description: '甜點、小食', sort_order: 3, is_active: true, created_at: now, updated_at: now },
    ]);

    // Seed Default Settings
    await queryInterface.bulkInsert('settings', [
      { store_id: null, key: 'checkout_mode', value: JSON.stringify('pre_pay'), created_at: now, updated_at: now },
      { store_id: null, key: 'allow_order_modification', value: JSON.stringify(true), created_at: now, updated_at: now },
      { store_id: null, key: 'tax_rate', value: JSON.stringify(0), created_at: now, updated_at: now },
      { store_id: null, key: 'receipt_header', value: JSON.stringify('感謝您的光臨'), created_at: now, updated_at: now },
      { store_id: null, key: 'receipt_footer', value: JSON.stringify('歡迎再次光臨'), created_at: now, updated_at: now },
    ]);

    console.log('\n📌 Default credentials:');
    console.log('   Email: admin@pos-switch.com');
    console.log('   Password: admin123\n');
  },

  async down(queryInterface, Sequelize) {
    // Delete in reverse order
    await queryInterface.bulkDelete('settings', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('stores', null, {});
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('roles', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
  },
};
