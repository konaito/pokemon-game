/**
 * モンスター個体の一意識別子を生成
 * Web Crypto API を使用（ブラウザ/Node.js 両対応）
 */
export function generateUid(): string {
  return crypto.randomUUID();
}
