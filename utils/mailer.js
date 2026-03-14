import SibApiV3Sdk from "sib-api-v3-sdk";

const client = SibApiV3Sdk.ApiClient.instance;
// Trim to remove any accidental whitespace/newlines from env var
const brevoKey = (process.env.BREVO_API_KEY || "").trim();
if (!brevoKey) {
  console.warn("WARNING: BREVO_API_KEY is not set. Emails will not be sent.");
}
client.authentications["api-key"].apiKey = brevoKey;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {string} [html]
 */
export async function sendmail({ to, subject, text, html }) {
  if (!brevoKey) {
    console.warn(`Skipping email to ${to} — BREVO_API_KEY not configured.`);
    return;
  }

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