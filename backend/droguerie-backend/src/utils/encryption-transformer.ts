import * as dotenv from 'dotenv';
dotenv.config();

import { ValueTransformer } from 'typeorm';
import * as crypto from 'crypto';

/**
 * TypeORM Transformer for military-grade data-at-rest encryption (AES-256-CBC).
 * Handles Graceful Fallback: If data is not encrypted (plain text), it returns as-is.
 * Lazy Loading: The key is fetched from process.env at the moment of encryption/decryption.
 */
export class EncryptionTransformer implements ValueTransformer {
  private readonly algorithm = 'aes-256-cbc';
  private readonly ivSize = 16;
  private readonly magicPrefix = 'enc:'; // To identify encrypted data

  constructor() {
    // We NO LONGER initialize the key in the constructor to avoid capturing empty env vars
  }

  /**
   * Lazily fetches the encryption key from environment variables.
   * Ensures the key is available even during early TypeORM initialization.
   */
  private getKey(): Buffer | null {
    const rawKey = process.env.ENCRYPTION_KEY;
    if (!rawKey || rawKey.length !== 64) {
      console.error('CRITICAL: ENCRYPTION_KEY is missing or invalid (must be 64 characters hex). Encryption skipped.');
      return null;
    }
    return Buffer.from(rawKey, 'hex');
  }

  // Before saving to DB
  to(value: string | null): string | null {
    if (!value || value.startsWith(this.magicPrefix)) return value;

    const key = this.getKey();
    if (!key) return value; // Fallback to plain text if key is missing (logs error above)

    try {
      const iv = crypto.randomBytes(this.ivSize);
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      let encrypted = cipher.update(value, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Format: magicPrefix + IV + encryptedData
      return `${this.magicPrefix}${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      console.error('Encryption failed:', error);
      return value;
    }
  }

  // After loading from DB
  from(value: string | null): string | null {
    if (!value || !value.startsWith(this.magicPrefix)) return value;

    const key = this.getKey();
    if (!key) return value; // Cannot decrypt without a key

    try {
      // Split by magicPrefix and colon
      const parts = value.slice(this.magicPrefix.length).split(':');
      if (parts.length !== 2) return value; // Invalid format

      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = parts[1];
      
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      // If decryption fails (e.g. wrong key), return the raw value
      console.error('Decryption failed. Database key may have changed or data is corrupted.');
      return value;
    }
  }
}

export const encryptionTransformer = new EncryptionTransformer();
