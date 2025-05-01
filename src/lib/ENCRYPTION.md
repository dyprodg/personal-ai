# Chat Encryption

This application now encrypts all chat data stored in Redis using AES-256-CBC encryption.

## Setup

To use the encryption feature, you must set an encryption key in your environment variables:

1. Add the following to your `.env` file:

```
# Used for encrypting chat data in Redis
# Must be at least 32 characters long (will be truncated if longer)
ENCRYPTION_KEY=your_very_strong_and_secure_encryption_key_here
```

2. Replace `your_very_strong_and_secure_encryption_key_here` with a strong, random key. 
   - The key must be at least 32 characters long
   - Consider using a password generator or running this command:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

## Important Notes

- **Existing Data**: Any existing chat data in Redis will need to be migrated to the encrypted format.
- **Key Security**: Keep your encryption key secure. If you lose it, you won't be able to decrypt existing chats.
- **Backup**: Consider backing up your encryption key securely.

## How It Works

The encryption system uses:
- AES-256-CBC algorithm for encryption
- A unique initialization vector (IV) for each encryption operation
- The IV is stored alongside the encrypted data to allow for decryption

All Redis operations in the chat actions have been updated to encrypt data before storing and decrypt data after retrieval. 