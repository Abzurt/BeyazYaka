import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/security'

const prisma = new PrismaClient()

async function createAdmin() {
  const username = 'abzurt'
  const email = 'abzurt@beyazyaka.com'
  const password = 'AbzurtPassword123!'
  
  console.log(`Creating admin user: ${username}...`)
  
  const passwordHash = await hashPassword(password)
  
  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: 'admin',
        displayName: 'Abzurt Admin',
        isActive: true
      }
    })
    console.log('Admin account created successfully!')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
