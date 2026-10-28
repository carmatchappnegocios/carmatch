import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  const session = await auth();
  
  // Robust admin check: 1) session.isAdmin, 2) email match, 3) direct DB query
  let isAdmin = !!session?.user?.isAdmin
  if (!isAdmin && session?.user?.email && process.env.ADMIN_EMAIL) {
      isAdmin = session.user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
  }
  if (!isAdmin && session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email.toLowerCase() },
          select: { isAdmin: true }
      })
      isAdmin = !!dbUser?.isAdmin
  }
  
  if (!isAdmin) {
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
