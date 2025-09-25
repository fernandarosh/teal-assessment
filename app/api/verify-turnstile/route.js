import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ success: false, error: 'missing-token' }, { status: 400 });
    }

    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ success: false, error: 'missing-secret' }, { status: 500 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);
    if (ip) formData.append('remoteip', ip);

    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    if (!r.ok) {
      return NextResponse.json({ success: false, error: 'verify-request-failed' }, { status: 502 });
    }

    const data = await r.json();

    return NextResponse.json({
      success: !!data.success,
      meta: { hostname: data.hostname, errors: data['error-codes'] ?? [] },
    });
  } catch (e) {
    console.error('Turnstile verification error:', e);
    return NextResponse.json({ success: false, error: 'exception' }, { status: 500 });
  }
}
