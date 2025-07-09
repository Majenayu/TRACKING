import { JSEncrypt } from 'jsencrypt';

export interface RSAKeyPair {
  publicKey: string;
  privateKey: string;
}

export class RSACrypto {
  private jsEncrypt: JSEncrypt;

  constructor() {
    this.jsEncrypt = new JSEncrypt();
  }

  generateKeyPair(): RSAKeyPair {
    this.jsEncrypt.getKey();
    return {
      publicKey: this.jsEncrypt.getPublicKey(),
      privateKey: this.jsEncrypt.getPrivateKey()
    };
  }

  encrypt(data: string, publicKey: string): string {
    this.jsEncrypt.setPublicKey(publicKey);
    const encrypted = this.jsEncrypt.encrypt(data);
    if (!encrypted) {
      throw new Error('Failed to encrypt data');
    }
    return encrypted;
  }

  decrypt(encryptedData: string, privateKey: string): string {
    this.jsEncrypt.setPrivateKey(privateKey);
    const decrypted = this.jsEncrypt.decrypt(encryptedData);
    if (!decrypted) {
      throw new Error('Failed to decrypt data');
    }
    return decrypted;
  }
}

export const rsaCrypto = new RSACrypto();
