
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import config from "../config/env";
interface EmailDetails {
  FormName?: string;
  FromAddress: string;
  ToAddress?: string[];
  CCAddress?: string[];
  BCCAddress?: string[];
  Subject: string;
  Body: string;
}

// Shared SES client (reuse instead of creating new one each call)
const ses = new SESClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: config.AwsAccessKey,
    secretAccessKey: config.AwsSecretKey,
  },
});

export async function sendEmailAddressBook(
  methodName: string,
  statusCode: number,
  userToken?: string,
  emailAddress?: string
): Promise<void> {
  // ✅ Create SES client (v3 style)
  const ses = new SESClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: config.AwsAccessKey,
      secretAccessKey: config.AwsSecretKey,
    },
  });

  const mailSubject = "Received Unexpected Error from Address Book API";
  const fromMailAddress = config.FromMailAddress;

  // ✅ same HTML template
  const mailBody = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Email Template</title>
    <style>
      body { background-color: #f2f2f2; margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; }
      .container { width: 100%; margin: 0 auto; max-width: 1010px; }
      .email-wrapper { max-width: 660px; background: #fff; margin: 40px auto 0; border: 2px solid #ccc; }
      .header { padding: 15px; line-height: 22px; }
      .logo { text-align: center; padding: 15px; }
      .content { text-align: center; padding: 20px; }
      .footer { margin-top: 10px; font-size: 13px; text-align: center; color: #757575; }
      .footer p { margin: 0; }
      .footer a { color: #00F; }
      @media only screen and (max-width: 600px) {
        .email-wrapper { max-width: 100%; border-radius: 0; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="email-wrapper">
        <div class="header">
          <div class="logo">
            <img src="https://v1-sandbox.taxbandits.com/Content/Images/logo.png" alt="Logo" />
          </div>
          <div>
            <h2 style="font-size: 18px; font-weight: normal; margin-top: 20px; margin-bottom: 5px;">
              <b>Hello Team</b>
            </h2>
            <p>We have received a Status of ${statusCode} from Address Book API. Here are the details:</p>
            <ul>
              <li><b>Email Address:</b> ${emailAddress || "N/A"}</li>
              <li><b>User Token:</b> ${userToken || "N/A"}</li>
              <li><b>Method Name:</b> ${methodName}</li>
            </ul>
            <p>Please review and address this request.</p>
          </div>
        </div>
      </div>
      <div class="footer">
        <p>© 2025 TaxBandits.com, SPAN Enterprises, LLC. All rights reserved.</p>
        <p style="font-weight: 600;">Corporate Office:</p>
        <p>Span Enterprises LLC. 
          <a href="https://maps.google.com/?q=2685+Celanese+Rd+%23103,+Rock+Hill,+SC+29732" target="_blank">
            2685 Celanese Road Suite 100, Rock Hill SC 29732
          </a>
        </p>
      </div>
    </div>
  </body>
  </html>
  `;

  // ✅ split multiple recipients if needed
  const toAddresses = config.ExceptionMailToAddress?.includes(",")
    ? config.ExceptionMailToAddress.split(",").map((a) => a.trim())
    : [config.ExceptionMailToAddress || ""];

  // ✅ Build SendEmailCommand input
  const params = {
    Source: fromMailAddress,
    Destination: { ToAddresses: toAddresses },
    Message: {
      Subject: { Data: mailSubject, Charset: "UTF-8" },
      Body: { Html: { Data: mailBody, Charset: "UTF-8" } },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await ses.send(command);
    console.log("SES email sent:", response.MessageId);
  } catch (error) {
    console.error("Failed to send SES email:", error);
  }
}

/**
 * Bandit Cash Exception Email
 */
export async function sendMailBanditCash(
  methodName: string,
  exceptionMessage: string,
  userToken?: string,
  emailAddress?: string
) {
  const fromName = "TBS API";
  const fromEmail = `"${fromName}" <${config.FromMailAddress}>`;

  const toAddresses = config.ExceptionMailToAddress?.includes(",")
    ? config.ExceptionMailToAddress.split(",").map((a) => a.trim())
    : [config.ExceptionMailToAddress || ""];

  const mailSubject = "Received Unexpected Error from Bandits Cash API";

  const mailBody = `
  <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
    <body>
      <div style="background:#3097f3; padding:15px; text-align:center; color:#fff; font:bold italic 1.5em Arial;">
        Exception
      </div>
      <div style="padding:20px;">
        <table style="width:100%; font-size:15px; color:#000; border-collapse: collapse; border: 1px solid #ccc;">
          <tr>
            <td style="padding:6px; font-weight:700;">Exception Message</td>
            <td style="padding:6px;">${exceptionMessage}</td>
          </tr>
          <tr>
            <td style="padding:6px; font-weight:700;">Payment API Endpoint</td>
            <td style="padding:6px;">${methodName}</td>
          </tr>
          <tr>
            <td style="padding:6px; font-weight:700;">Email Address</td>
            <td style="padding:6px;">${emailAddress || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding:6px; font-weight:700;">User Token</td>
            <td style="padding:6px;">${userToken || "N/A"}</td>
          </tr>
        </table>
      </div>
    </body>
  </html>`;

  const params = {
    Source: fromEmail,
    Destination: { ToAddresses: toAddresses },
    Message: {
      Subject: { Data: mailSubject, Charset: "UTF-8" },
      Body: { Html: { Data: mailBody, Charset: "UTF-8" } },
    },
  };

  try {
    const result = await ses.send(new SendEmailCommand(params));
    console.log("Error email sent to Bandit Cash team:", result.MessageId);
  } catch (err) {
    console.error("Failed to send Bandit Cash error email:", err);
  }
}



/**
 * General Email Sender
 */
export async function sendEmail(emailDetails: EmailDetails): Promise<void> {


  const params = {
    Source: emailDetails.FromAddress,
    Destination: {
      ToAddresses: emailDetails.ToAddress || [],
      CcAddresses: emailDetails.CCAddress || [],
      BccAddresses: emailDetails.BCCAddress || [],
    },
    Message: {
      Subject: { Data: emailDetails.Subject, Charset: "UTF-8" },
      Body: {
        Html: { Data: emailDetails.Body, Charset: "UTF-8" },
      },
    },
  };

  try {
    const result = await ses.send(new SendEmailCommand(params));
    console.log(`Email sent: ${emailDetails.Subject}, MessageId: ${result.MessageId}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}


