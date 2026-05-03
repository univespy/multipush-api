import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Twilio from 'twilio';

type TwilioClient = ReturnType<typeof Twilio>;

@Injectable()
export class TwilioService {
  private readonly client: TwilioClient;
  private readonly from: string;
  private readonly logger = new Logger(TwilioService.name);

  constructor(private readonly configService: ConfigService) {
    const accountSid = configService.getOrThrow<string>('TWILIO_ACCOUNT_SID');
    const authToken = configService.getOrThrow<string>('TWILIO_AUTH_TOKEN');
    this.from = configService.getOrThrow<string>('TWILIO_PHONE_NUMBER');
    this.client = Twilio(accountSid, authToken);
  }

  async sendSms(to: string, body: string): Promise<{ sid: string }> {
    this.logger.log(`Enviando SMS para ${to}`);
    const message = await this.client.messages.create({ from: this.from, to, body });
    this.logger.log(`SMS enviado com SID=${message.sid}`);
    return { sid: message.sid };
  }
}
