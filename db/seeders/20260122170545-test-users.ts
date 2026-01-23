import { QueryInterface, Sequelize, QueryTypes, Op } from 'sequelize';
import bcrypt from 'bcryptjs';

/**
 * Test users seeder
 * Seeds test users for each role: Manager, Cashier, Auditor
 * 
 * Test Accounts:
 * - manager@pos-switch.com / manager123 (Manager role)
 * - cashier@pos-switch.com / cashier123 (Cashier role)
 * - auditor@pos-switch.com / auditor123 (Auditor role)
 */

interface RoleRow {
  id: number;
  name: string;
}

interface StoreRow {
  id: number;
}

export async function up(queryInterface: QueryInterface, _Sequelize: typeof Sequelize): Promise<void> {
  const now = new Date();

  // Get role IDs
  const roles = await queryInterface.sequelize.query<RoleRow>(
    'SELECT id, name FROM roles',
    { type: QueryTypes.SELECT }
  );
  const roleMap: Record<string, number> = {};
  roles.forEach(r => { roleMap[r.name] = r.id; });

  // Get default store ID
  const stores = await queryInterface.sequelize.query<StoreRow>(
    'SELECT id FROM stores LIMIT 1',
    { type: QueryTypes.SELECT }
  );
  const storeId = stores[0].id;

  // Hash passwords
  const managerPassword = await bcrypt.hash('manager123', 10);
  const cashierPassword = await bcrypt.hash('cashier123', 10);
  const auditorPassword = await bcrypt.hash('auditor123', 10);

  // Seed test users
  await queryInterface.bulkInsert('users', [
    {
      store_id: storeId,
      role_id: roleMap['Manager'],
      email: 'manager@pos-switch.com',
      password_hash: managerPassword,
      name: '測試店長',
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      store_id: storeId,
      role_id: roleMap['Cashier'],
      email: 'cashier@pos-switch.com',
      password_hash: cashierPassword,
      name: '測試收銀員',
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      store_id: storeId,
      role_id: roleMap['Auditor'],
      email: 'auditor@pos-switch.com',
      password_hash: auditorPassword,
      name: '測試查帳員',
      is_active: true,
      created_at: now,
      updated_at: now,
    },
  ], {});

  console.log('\n📌 Test user credentials:');
  console.log('   Manager - Email: manager@pos-switch.com | Password: manager123');
  console.log('   Cashier - Email: cashier@pos-switch.com | Password: cashier123');
  console.log('   Auditor - Email: auditor@pos-switch.com | Password: auditor123\n');
}

export async function down(queryInterface: QueryInterface, _Sequelize: typeof Sequelize): Promise<void> {
  // Delete test users by email
  await queryInterface.bulkDelete('users', {
    email: {
      [Op.in]: [
        'manager@pos-switch.com',
        'cashier@pos-switch.com',
        'auditor@pos-switch.com',
      ],
    },
  });
}
