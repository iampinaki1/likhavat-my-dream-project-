import SibApiV3Sdk from "sib-api-v3-sdk";

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey =
  process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {string} [html]
 */
export async function sendmail({ to, subject, text, html }) {
  const emailPayload = {
    sender: {
      email: "pinaki82499730@gmail.com",
      name: "Dept Verification",
    },
    to: [{ email: to }],
    subject: subject,
  };

  if (html) {
    emailPayload.htmlContent = html;
  }
  if (text) {
    emailPayload.textContent = text;
  }

  await emailApi.sendTransacEmail(emailPayload);

  console.log("Email sent via Brevo API ");
}