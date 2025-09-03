import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // Create Categories
  const categories = [
    'Web Development',
    'Mobile Development',
    'Graphic Design',
    'Content Writing',
    'Digital Marketing',
    'Video Editing',
    'Virtual Assistant',
    'Data Entry',
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Categories seeded.');

  // Create Demo Users
  const password = await bcrypt.hash('password123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: password,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          bio: 'Platform administrator.',
        },
      },
    },
  });

  const clientUser = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      password: password,
      role: UserRole.CLIENT,
      emailVerified: new Date(),
      profile: {
        create: {
          firstName: 'Client',
          lastName: 'User',
          bio: 'Looking for talented freelancers!',
        },
      },
    },
  });

  const freelancerUser = await prisma.user.upsert({
    where: { email: 'freelancer@example.com' },
    update: {},
    create: {
      email: 'freelancer@example.com',
      password: password,
      role: UserRole.FREELANCER,
      emailVerified: new Date(),
      profile: {
        create: {
          firstName: 'Freelancer',
          lastName: 'User',
          bio: 'Ready to take on new projects!',
          skills: ['Web Development', 'React', 'Node.js'],
          portfolioLinks: ['https://example.com/portfolio-freelancer'],
        },
      },
    },
  });

  console.log('Demo users seeded:', { adminUser: adminUser.email, clientUser: clientUser.email, freelancerUser: freelancerUser.email });

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });