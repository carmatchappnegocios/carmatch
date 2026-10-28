import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const body = await request.json();
  const email = body.email;
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.email === process.env.ADMIN_EMAIL) {
    return NextResponse.json(
      { error: 'Cannot delete main admin' },
      { status: 400 }
    );
  }

  await prisma.user.delete({ where: { id: user.id } });
  return NextResponse.json({ success: true, email });
}
