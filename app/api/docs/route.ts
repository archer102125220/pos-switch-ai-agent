import { NextResponse } from 'next/server';
import { getApiDocs } from '@/lib/swagger';

/**
 * GET /api/docs
 * Returns OpenAPI JSON specification
 */
export async function GET() {
  const spec = getApiDocs();
  return NextResponse.json(spec);
}
