import { prisma } from '@/lib/db'

async function deleteAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@carmatchapp.net'
  const user = await prisma.user.findUnique({
    where: { email: adminEmail },
  })
  if (!user) {
    console.log('No admin user found with email:', adminEmail)
    return
  }
  await prisma.user.delete({
    where: { id: user.id },
  })
  console.log('Deleted admin user:', adminEmail)
}

deleteAdmin().catch(console.error)
