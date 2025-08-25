import { UserDetail } from "../models/basemodels/user";
import config from "../config/env";
import { sendEmail } from "../utils/mail";
import { getClientIpAddress } from "../utils/utility";
import { FastifyRequest, FastifyReply } from "fastify";
import { mailTemplates } from "../templates/template";
import { EmailDetails } from "../models/basemodels/mailBodyModel";

export async function exceptionMiddleware(
  error: Error & { statusCode?: number },
  request: FastifyRequest,
  reply: FastifyReply
) {
  const queryString = request.query ? JSON.stringify(request.query) : "N/A";
  const nowEST = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });
  const user = request.UserDetail as UserDetail;
  // Format stack trace
  const stackLines = (error.stack || "").split("\n");
  let formattedStack = "";
  stackLines.forEach((line) => {
    if (!line.includes("node_modules")) {
      formattedStack += line + "<br/>";
    }
  });

  let hostIp = getClientIpAddress(request);

  // Extract Bearer token from Authorization header
  const accessToken = request.headers.authorization
    ?.toString()
    ?.replace("Bearer", "")
    ?.trim();

  // Replace placeholders in template
  const mailBody = mailTemplates.ExceptionTemplate.replace(
    /@@ErrorMessage/g,
    `<span style="color: black; font-weight: normal;">${error.message}</span>`
  )
    .replace(/@@StackTrace/g, formattedStack || "No stack trace")
    .replace(
      /@@SourcePath/g,
      `<span style="color: black; font-weight: normal;">${
        request.url || "N/A"
      }</span>`
    )
    .replace(
      /@@UrlPath/g,
      `<span style="color: black; font-weight: normal;">${
        request.url || "N/A"
      }</span>`
    )
    .replace(
      /@@MethodType/g,
      `<span style="color: black; font-weight: normal;">${
        request.method || "N/A"
      }</span>`
    )
    .replace(
      /@@QueryString/g,
      `<span style="color: black; font-weight: normal;">${queryString}</span>`
    )
    .replace(
      /@@ExceptionTime/g,
      `<span style="color: black; font-weight: normal;">${nowEST}</span>`
    )
    .replace(
      /@@ErrorStack/g,
      `<span style="color: black; font-weight: normal;">${
        formattedStack || "No stack trace"
      }</span>`
    )
    .replace(
      /@@EmailAddress/g,
      `<span style="color: black; font-weight: normal;">${
        user?.userEmail || "N/A"
      }</span>`
    )
    .replace(
      /@@UserId/g,
      `<span style="color: black; font-weight: normal;">${
        user?.userId || "N/A"
      }</span>`
    )
    .replace(
      /@@AddressBookToken/g,
      `<span style="color: black; font-weight: normal;">${
        user?.addressbookToken || "N/A"
      }</span>`
    )
    .replace(
      /@@PartnerUserId/g,
      `<span style="color: black; font-weight: normal;">${
        user?.parentUserId || "N/A"
      }</span>`
    )
    .replace(
      /@@IPAddress/g,
      `<span style="color: black; font-weight: normal;">${
        hostIp || "N/A"
      }</span>`
    )
    .replace(
      /@@APIToken/g,
      `<span style="color: black; font-weight: normal;">${
        accessToken || "N/A"
      }</span>`
    )
    .replace(
      /@@UserToken/g,
      `<span style="color: black; font-weight: normal;">${
        user?.userToken || "N/A"
      }</span>`
    );
  const fromName = "TBS API States";
  const fromEmail = `"${fromName}" <${config.FromMailAddress}>`;
  let toAddresses = config.ExceptionMailToAddress?.includes(",")
    ? config.ExceptionMailToAddress.split(",").map((a) => a.trim())
    : [config.ExceptionMailToAddress || ""];
  const emailDetails: EmailDetails = {
    FromAddress: fromEmail,
    ToAddress: toAddresses,
    Subject: config.ExceptionMailSubject,
    Body: mailBody,
  };

  await sendEmail(emailDetails);
  // 🔹 send safe response to client
  reply.status(error.statusCode ?? 500).send();
}
