import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, firstName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!process.env.RESEND_WELCOME_TEMPLATE_ID) {
      console.error('RESEND_WELCOME_TEMPLATE_ID environment variable is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'konwolorentz@contact.refinedocs.com',
        to: [email],
        subject: 'Welcome to Refinedocs!',
        template: {
          id: process.env.RESEND_WELCOME_TEMPLATE_ID,
          variables: {
            firstName: firstName || 'there',
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return NextResponse.json({ error: data }, { status: response.status });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Welcome email API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
