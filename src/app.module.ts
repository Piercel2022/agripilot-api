import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { OrganizationsModule } from './organizations/organizations.module.js';
import { UsersModule } from './users/users.module.js';
import { FarmsModule } from './farms/farms.module.js';
import { FieldsModule } from './fields/fields.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CropsModule } from './crops/crops.module.js';
import { CampaignsModule } from './campaigns/campaigns.module.js';
import { InterventionsModule } from './interventions/interventions.module.js';
import { IrrigationModule } from './irrigation/irrigation.module.js';
import { FertilisationModule } from './fertilisation/fertilisation.module.js';
import { ObservationsModule } from './observations/observations.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: Number(configService.get('DATABASE_PORT')),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    OrganizationsModule,
    UsersModule,
    FarmsModule,
    FieldsModule,
    AuthModule,
    CampaignsModule,
    CropsModule,
    InterventionsModule,
    IrrigationModule,
    FertilisationModule,
    ObservationsModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}