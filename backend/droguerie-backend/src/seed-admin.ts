import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { UserRole } from './users/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPass = process.env.ADMIN_PASS;

  if (!adminEmail || !adminPass) {
    console.error('Missing ADMIN_EMAIL or ADMIN_PASS in environment variables.');
    await app.close();
    return;
  }

  try {
    const existing = await usersService.findByEmail(adminEmail);
    if (existing) {
      console.log('Admin user already exists.');
    } else {
      await usersService.create({
        email: adminEmail,
        password: adminPass,
        fullName: 'Administrateur Principal',
        role: UserRole.ADMIN,
      });
      console.log('Admin user created successfully!');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPass}`);
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
