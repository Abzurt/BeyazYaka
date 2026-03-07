import { argon2id } from "hash-wasm";
import zxcvbn from "zxcvbn-typescript";

/**
 * Güvenli rastgele salt oluşturma (Edge compatible)
 */
function generateSalt(length = 16): Uint8Array {
  const salt = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(salt);
  } else {
    // Edge Runtime always has global crypto. This is a safe fallback for other environments.
    for (let i = 0; i < length; i++) {
      salt[i] = Math.floor(Math.random() * 256);
    }
  }
  return salt;
}

/**
 * Base64 to Uint8Array (Edge compatible replacement for Buffer)
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Argon2id ile şifre hash'leme (hash-wasm)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  return await argon2id({
    password: password,
    salt: salt,
    parallelism: 1,
    iterations: 3,
    memorySize: 65536,
    hashLength: 32,
    outputType: "encoded",
  });
}

/**
 * Argon2id ile şifre doğrulama (hash-wasm)
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    const parts = hash.split('$');
    if (parts.length < 6) return false;

    const params = parts[3];
    const saltBase64 = parts[4];

    const [mParam, tParam, pParam] = params.split(',');
    const m = parseInt(mParam.split('=')[1]);
    const t = parseInt(tParam.split('=')[1]);
    const p = parseInt(pParam.split('=')[1]);

    const result = await argon2id({
      password: password,
      salt: base64ToUint8Array(saltBase64),
      parallelism: p,
      iterations: t,
      memorySize: m,
      hashLength: 32,
      outputType: "encoded",
    });

    return result === hash;
  } catch (err) {
    return false;
  }
}

/**
 * Şifre karmaşıklık kuralları
 */
export function validatePassword(password: string, email?: string, username?: string): { isValid: boolean; error?: string } {
  if (password.length < 12) {
    return { isValid: false, error: "Şifre en az 12 karakter olmalıdır." };
  }
  if (password.length > 128) {
    return { isValid: false, error: "Şifre en fazla 128 karakter olmalıdır." };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "Şifre en az 1 büyük harf içermelidir." };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: "Şifre en az 1 rakam içermelidir." };
  }

  if (email && password.toLowerCase() === email.toLowerCase()) {
    return { isValid: false, error: "Şifre e-posta adresinizle aynı olamaz." };
  }

  if (username && password.toLowerCase().includes(username.toLowerCase())) {
    return { isValid: false, error: "Şifre kullanıcı adınızı içeremez." };
  }

  const strength = zxcvbn(password);
  if (strength.score < 3) {
    return { isValid: false, error: "Şifreniz çok yaygın ve kolay tahmin edilebilir." };
  }

  return { isValid: true };
}
