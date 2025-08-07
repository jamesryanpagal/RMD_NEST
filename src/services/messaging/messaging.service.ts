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
        from: `${config.email_from}${config.domain}`,
        to: ["rmdland21@gmail.com"],
        subject: "Welcome to Acme",
        html: `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
              <style>
                * {
                    margin: 0;
                    padding: 0;
                    font-family: 'Roboto', Arial, sans-serif;

                }
                .receipt-container {
                    border-radius: 5px;
                    margin-left: 50px;
                    margin-right: 50px;
                    border: 1px solid #e7ecef;
                    padding: 20px 30px 20px 30px;
                    box-shadow: 0 4px 6px #e7ecef;
                    display: flex;
                    flex-direction: column;
                    gap: 20px
                }
                .header {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                    gap: 10px;
                }
                .icon-container, .filler {
                    width: 80px;
                    height: 80px;
                }
                .header-title, .header-subtitle {
                    text-align: center;
                }
                .details-container {
                  display: flex;
                  gap: 10px;
                }
                .details {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  gap: 5px;
                }
                .details-row {
                  display: flex;
                  gap: 10px;
                }
                .details-row h4 {
                  width: 150px;
                }
                .details-row-value-container {
                  flex: 1;
                  border-bottom: 1px solid;
                  padding-bottom: 2px
                }
                .payment-type p {
                  text-align: end
                }
                @media only screen and (max-width: 600px) {
                  .details-container {
                    flex-direction: column;
                    gap: 40px;
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="receipt-container">
                  <div class="header">
                    <div class="icon-container"></div>
                    <div class="title-container">
                      <h2 class="header-title">RMD LAND</h2>
                      <p class="header-subtitle">I Pascual St. Brgy. Special District, Jalajala Rizal</p>
                      <p class="header-subtitle">09123-123-123 - test@gmail.com</p>
                    </div>
                    <div class="filler"></div>
                  </div>
                  <h3 class="header-title">INVOICE</h3>
                  <div class="details-container">
                    <div class="details">
                      <div class="details-row">
                        <h4>Project Name:</h4>
                        <div class="details-row-value-container">
                          <p class="details-row-value">
                            Palaypalay Sitio Tanauan Subdivision (Phase 1)
                          </p>
                        </div>
                      </div>
                      <div class="details-row">
                        <h4>Blk. & Lot:</h4>
                        <div class="details-row-value-container">
                          <p class="details-row-value">Blk 1, Lot 2</p>
                        </div>
                      </div>
                      <div class="details-row">
                        <h4>Mode of Payment:</h4>
                        <div class="details-row-value-container">
                          <p class="details-row-value">Cash</p>
                        </div>
                      </div>
                      <div class="details-row">
                        <h4>Reference No.:</h4>
                        <div class="details-row-value-container">
                          <p class="details-row-value">---</p>
                        </div>
                      </div>
                      <div class="details-row">
                        <h4>Team Head / Agent:</h4>
                        <div class="details-row-value-container">
                          <p class="details-row-value">Test Name</p>
                        </div>
                      </div>
                    </div>
                    <div class="details">
                      <div class="details-row">
                        <h4>Received from:</h4>
                        <div class="details-row-value-container">
                          <p class="details-row-value">Test Name</p>
                        </div>
                      </div>
                      <div class="details-row">
                        <h4>Address:</h4>
                        <div class="details-row-value-container">
                          <p class="details-row-value">Test Address</p>
                        </div>
                      </div>
                      <div class="details-row">
                        <h4>The sum of:</h4>
                        <div class="details-row-value-container">
                          <p class="details-row-value">Test Name</p>
                        </div>
                      </div>
                      <div class="payment-type">
                        <p>As Monthly Payment</p>
                      </div>
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
