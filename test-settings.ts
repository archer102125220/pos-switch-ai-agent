// Test script to verify Sequelize NULL query
import { Setting } from './db/models/index';
import { Op } from 'sequelize';

async function test() {
  console.log('Testing Sequelize queries...\n');
  
  // Test 1: Query with Op.is(null)
  console.log('Test 1: Using Op.is(null)');
  const settings1 = await Setting.findAll({
    where: { storeId: { [Op.is]: null } }
  });
  console.log(`Found ${settings1.length} settings`);
  settings1.forEach(s => console.log(`  - ${s.key}: ${s.value}`));
  
  // Test 2: Query with null directly
  console.log('\nTest 2: Using null directly');
  const settings2 = await Setting.findAll({
    where: { storeId: null }
  });
  console.log(`Found ${settings2.length} settings`);
  
  // Test 3: Query all settings
  console.log('\n Test 3: All settings');
  const all = await Setting.findAll();
  console.log(`Found ${all.length} total settings`);
  
  process.exit(0);
}

test().catch(console.error);
