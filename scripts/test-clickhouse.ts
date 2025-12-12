/**
 * ClickHouse Connection Test Script
 * Tests database connection and configuration
 */

import 'dotenv/config';
import { initializeDatabase, getClickHouseStats, getDatabaseHealth } from '../lib/database/index.js';

async function testConnection() {
  console.log('🔍 ClickHouse Connection Test');
  console.log('================================\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   CLICKHOUSE_HOST: ${process.env.CLICKHOUSE_HOST ? '✅ Set' : '❌ Missing'}`);
  console.log(`   CLICKHOUSE_DATABASE: ${process.env.CLICKHOUSE_DATABASE || 'analysisday'}`);
  console.log(`   CLICKHOUSE_USER: ${process.env.CLICKHOUSE_USER || 'default'}`);
  console.log(`   CLICKHOUSE_PASSWORD: ${process.env.CLICKHOUSE_PASSWORD ? '✅ Set (hidden)' : '❌ Missing'}`);
  console.log('');

  try {
    // Initialize connection
    console.log('🔌 Attempting to connect...\n');
    await initializeDatabase();
    
    // Get connection stats
    console.log('\n📊 Connection Statistics:');
    const stats = getClickHouseStats();
    console.log(JSON.stringify(stats, null, 2));

    // Get health status
    console.log('\n🏥 Health Check:');
    const health = await getDatabaseHealth();
    console.log(JSON.stringify(health, null, 2));

    console.log('\n✅ All tests passed! ClickHouse is ready to use.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection test failed!');
    console.error('Error:', error instanceof Error ? error.message : String(error));
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check .env.local file exists');
    console.error('   2. Verify ClickHouse credentials are correct');
    console.error('   3. Make sure ClickHouse Cloud instance is running');
    console.error('   4. Test connection: curl --user "default:PASSWORD" --data-binary "SELECT 1" YOUR_HOST\n');
    process.exit(1);
  }
}

testConnection();
