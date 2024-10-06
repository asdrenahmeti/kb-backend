import { Controller, Post, Body } from '@nestjs/common';
import { EmailsService } from './emails.service';

@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  // @Post('send')
  // async sendEmail(@Body() emailData: any) {
  //   return this.emailsService.sendEmail('asdrenahmeti95@gmail.com', 'Test Subject', 'Test Body');
  // }
}
