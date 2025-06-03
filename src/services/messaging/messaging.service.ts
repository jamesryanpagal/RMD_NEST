import { Injectable } from "@nestjs/common";
import { Resend } from "resend";
import { config } from "src/config";
import { ExceptionService } from "../interceptor/interceptor.service";

@Injectable()
export class MessagingService {
  constructor(private exceptionService: ExceptionService) {}

  private resend = new Resend(config.resend_api_key);

  async onSendEmail() {
    try {
      const { data, error } = await this.resend.emails.send({
        from: "Acme <rmdland21@gmail.com>",
        to: ["jamesryanpagal02@gmail.com"],
        subject: "Welcome to Acme",
        html: "<strong>Yay! Your first email is on its way!</strong>",
      });

      if (error) {
        this.exceptionService.throw(
          `Failed to send email ${error?.message}`,
          "BAD_REQUEST",
        );
        return;
      }

      console.log("Email sent successfully:", data);
    } catch (error) {
      throw error;
    }
  }
}
