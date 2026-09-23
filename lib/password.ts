// 서버 전용 — API route(app/api/**)에서만 import한다.
// node:crypto는 브라우저 번들에 포함될 수 없으므로, 클라이언트 컴포넌트에서 실수로
// import하면 빌드 자체가 실패한다(추가 안전장치 역할).
//
// 별도 hashing 라이브러리(bcrypt 등)를 새로 설치하지 않고, Node.js 공식 문서가
// 권장하는 scrypt 기반 방식을 그대로 사용한다: 비밀번호마다 랜덤 salt를 생성해
// "salt:hash"(hex) 형태로 저장하고, 검증 시 같은 salt로 다시 유도한 키를
// timingSafeEqual로 비교한다(원본 hash를 복호화해서 비교하는 방식이 아니다).
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;

  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = (await scryptAsync(password, salt, keyBuffer.length)) as Buffer;
  if (derivedKey.length !== keyBuffer.length) return false;

  return timingSafeEqual(keyBuffer, derivedKey);
}
