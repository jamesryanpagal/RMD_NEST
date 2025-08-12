import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailService {
  constructor() {}

  async sendEmail() {
    try {
      return "Success";
    } catch (error) {
      throw error;
    }
  }
}
