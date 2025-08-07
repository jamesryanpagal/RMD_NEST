import { Injectable } from "@nestjs/common";
import { MessagingService } from "src/services/messaging/messaging.service";

@Injectable()
export class EmailService {
  constructor(private messagingService: MessagingService) {}

  async sendEmail() {
    try {
      const response = await this.messagingService.onSendEmail();
      return response;
    } catch (error) {
      throw error;
    }
  }
}
