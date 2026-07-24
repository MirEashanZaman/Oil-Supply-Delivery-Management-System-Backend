import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { Dealer } from './dealer.entity';
import { DealerService } from './dealer.service';
import { DealerController } from './dealer.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dealer]),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        ignoreTLS: true,
        secure: true,
        auth: {
          user: 'your gmail account',
          pass: 'generated password',
        },
      },
    }),
  ],
  controllers: [DealerController],
  providers: [DealerService],
  exports: [DealerService],
})
export class DealerModule { }