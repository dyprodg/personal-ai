import crypto from 'crypto';

/**
 * Encrypts data using AES-256-CBC with a random IV
 * @param data Object to encrypt
 * @returns Encrypted string in format "iv:encryptedData"
 */
export function encrypt<T>(data: T): string {
  // Get encryption key from environment variable
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  
  // Generate a random IV for each encryption
  const iv = crypto.randomBytes(16);
  
  // Create cipher using AES-256-CBC
  const cipher = crypto.createCipheriv(
    'aes-256-cbc', 
    Buffer.from(ENCRYPTION_KEY.slice(0, 32)), 
    iv
  );
  
  // Encrypt the data
  const serialized = JSON.stringify(data);
  let encrypted = cipher.update(serialized, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Return IV and encrypted data as a single string
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts data that was encrypted with the encrypt function
 * @param encryptedData String in format "iv:encryptedData"
 * @returns Decrypted and parsed data
 */
export function decrypt<T>(encryptedData: string): T {
  // Get encryption key from environment variable
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  
  // Check if encryptedData is a string
  if (typeof encryptedData !== 'string') {
    throw new TypeError('encryptedData is not a string');
  }
  
  // Split the IV and encrypted data
  const parts = encryptedData.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  // Create decipher
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc', 
    Buffer.from(ENCRYPTION_KEY.slice(0, 32)), 
    iv
  );
  
  // Decrypt the data
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  // Parse the JSON data
  return JSON.parse(decrypted) as T;
} 