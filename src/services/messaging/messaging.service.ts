import { Injectable } from "@nestjs/common";
import { Resend } from "resend";
import { config } from "src/config";
import { ExceptionService } from "../interceptor/interceptor.service";

@Injectable()
export class MessagingService {
  constructor(private exceptionService: ExceptionService) {}

  private resend = new Resend(config.resend_api_key);

  async onSendPaymentReminder() {
    try {
      const { data, error } = await this.resend.emails.send({
        from: `${config.email_from}${config.domain}`,
        to: ["rmdland21@gmail.com"],
        subject: "Monthly Payment Reminder",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; }
              .container { width: 100%; max-width: 800px; margin: 0 auto; }
              .receipt-container { border: 1px solid #e0e0e0; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
              .header { text-align: center; margin-bottom: 20px; }
              .title-container h2 { margin: 0; }
              .title-container p { margin: 5px 0; }
              .invoice-title { text-align: center; margin: 15px 0; font-weight: bold; }
              .details-container { width: 100%; border-collapse: collapse; }
              .details-column { width: 50%; vertical-align: top; padding-right: 20px; }
              .details-row { margin-bottom: 10px; }
              .label { font-weight: bold; width: 130px; display: inline-block; }
              .value-container { border-bottom: 1px solid #000; display: inline-block; min-width: 200px; padding-bottom: 2px; }
              .payment-type { text-align: right; margin-top: 20px; }
              .footer { margin-top: 30px; text-align: right; }
              .footer-row { margin-bottom: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="receipt-container">
                <div class="header">
                  <h2>RMD LAND</h2>
                  <p>I Pascual St. Bray. Special District, Jalajala Rizal</p>
                  <p>09123-123-123 - test@gmail.com</p>
                </div>
                
                <h3 class="invoice-title">INVOICE</h3>
                
                <table class="details-container">
                  <tr>
                    <td class="details-column">
                      <div class="details-row">
                        <span class="label">Project Name:</span>
                        <span class="value-container">Palaypalay Sitio Tanauan Subdivision (Phase 1)</span>
                      </div>
                      <div class="details-row">
                        <span class="label">Blk. & Lot:</span>
                        <span class="value-container">Blk 1, Lot 2</span>
                      </div>
                      <div class="details-row">
                        <span class="label">Mode of Payment:</span>
                        <span class="value-container">Cash</span>
                      </div>
                      <div class="details-row">
                        <span class="label">Reference No.:</span>
                        <span class="value-container">---</span>
                      </div>
                      <div class="details-row">
                        <span class="label">Team Head / Agent:</span>
                        <span class="value-container">Test Name</span>
                      </div>
                    </td>
                    <td class="details-column">
                      <div class="details-row">
                        <span class="label">Received from:</span>
                        <span class="value-container">Test Name</span>
                      </div>
                      <div class="details-row">
                        <span class="label">Address:</span>
                        <span class="value-container">Test Address</span>
                      </div>
                      <div class="details-row">
                        <span class="label">The sum of:</span>
                        <span class="value-container">Test Name</span>
                      </div>
                      <div class="payment-type">
                        <p>As Monthly Payment</p>
                      </div>
                    </td>
                  </tr>
                </table>
                
                <div class="footer">
                  <div class="footer-row">
                    <span class="label">No.:</span> RCP-2025123456
                  </div>
                  <div class="footer-row">
                    <span class="label">Date:</span> August 07, 2025
                  </div>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (error) {
        this.exceptionService.throw(
          `Failed to send email ${error?.message}`,
          "BAD_REQUEST",
        );
        return;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}
