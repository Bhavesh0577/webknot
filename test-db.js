const db = require('./src/models/database');

async function testDatabase() {
  console.log('Testing database connection...');
  try {
    await db.connect();
    
    console.log('Database connection: SUCCESS');
    
    // Test with College model
    const College = require('./src/models/College');
    const colleges = await College.getAll();
    console.log('Sample colleges:', colleges);
    
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

testDatabase();
