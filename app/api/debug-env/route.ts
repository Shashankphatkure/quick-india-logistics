import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const keys = Object.keys(process.env).sort();
  const exposed: Record<string, string> = {};
  for (const k of keys) {
    if (k.startsWith('S3_') || k.startsWith('AWS_') || k === 'DATABASE_URL' || k === 'NODE_ENV') {
      const v = process.env[k] ?? '';
      // Mask secret values
      if (v.length > 12 && (k.includes('SECRET') || k.includes('KEY') || k.includes('PASSWORD') || k === 'DATABASE_URL')) {
        exposed[k] = `${v.slice(0, 8)}...(${v.length} chars)`;
      } else {
        exposed[k] = v;
      }
    }
  }
  return NextResponse.json({
    has_DATABASE_URL: !!process.env.DATABASE_URL,
    has_S3_BUCKET: !!process.env.S3_BUCKET,
    has_S3_ACCESS_KEY_ID: !!process.env.S3_ACCESS_KEY_ID,
    total_env_keys: keys.length,
    relevant: exposed,
    NODE_ENV: process.env.NODE_ENV,
  });
}
