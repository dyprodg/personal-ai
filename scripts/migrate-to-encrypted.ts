/**
 * Chat Encryption Migration Script
 * 
 * This script migrates existing Redis chat data to encrypted format.
 * Run with: npx ts-node scripts/migrate-to-encrypted.ts
 */

import { migrateChatsToEncrypted } from '../src/lib/migrate-encryption';

async function main() {
  // Simple confirmation to prevent accidental runs
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('Continue with migration? (yes/no): ', async (answer: string) => {
    if (answer.toLowerCase() !== 'yes') {
      console.log('Migration aborted');
      readline.close();
      process.exit(0);
      return;
    }
    
    console.log('Starting migration...');
    try {
      const result = await migrateChatsToEncrypted();
      console.log('\nMigration completed with result:', result);
      
      if (result.success) {
        console.log('\n✅ Migration successful!');
        if (result.errorCount > 0) {
          console.log(`⚠️ Warning: ${result.errorCount} chats had errors during migration.`);
          console.log('   Check the logs above for details.');
        }
      } else {
        console.log('\n❌ Migration failed. See errors above.');
      }
    } catch (error) {
      console.error('\n❌ Migration failed with error:', error);
    } finally {
      readline.close();
      process.exit(0);
    }
  });
}

main().catch(error => {
  console.error('Migration script failed:', error);
  process.exit(1);
}); 