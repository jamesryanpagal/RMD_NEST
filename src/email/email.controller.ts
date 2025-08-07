import { Controller, Post } from "@nestjs/common";
import { EmailService } from "./email.service";

@Controller("emails")
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post("send")
  onSendEmail() {
    return this.emailService.sendEmail();
  }
}
