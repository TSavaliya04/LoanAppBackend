import CryptoJS from 'crypto-js';

const secret = "qk3TSvD1YzJSBCmv";

export function encrypt(plainText: string): string {
  const key = CryptoJS.enc.Utf8.parse(secret);

  const encryptedBytes = CryptoJS.AES.encrypt(plainText, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encryptedBytes.toString();
}

export function decrypt(cipherText: string): string {
  if (!cipherText) return ''; // Handle null or undefined

  const key = CryptoJS.enc.Utf8.parse(secret);
  const base64Encoded = cipherText.replaceAll('-', '/').replaceAll('_', '+');
  const decryptedBytes = CryptoJS.AES.decrypt(base64Encoded, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });

  const decodedString = decryptedBytes.toString(CryptoJS.enc.Utf8);
  return decodedString || ''; // Return empty string if decoding fails
}