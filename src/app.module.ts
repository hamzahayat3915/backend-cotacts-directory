import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { CourtModule } from './court/court.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule globally available
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST'),
        port: parseInt(configService.get<string>('DATABASE_PORT'), 10),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true, // Set to false in production
        connectTimeout: parseInt(configService.get<string>('DATABASE_CONNECT_TIMEOUT'), 10),
        retryAttempts: parseInt(configService.get<string>('DATABASE_RETRY_ATTEMPTS'), 10),
        retryDelay: parseInt(configService.get<string>('DATABASE_RETRY_DELAY'), 10),
      }),
    }),
    AdminModule,
    UserModule,
    CourtModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
