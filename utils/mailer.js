import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const mail = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email_USERS,
    pass: process.env.Email_PASS,
  },
});
/**
 *@param {string} to
 *@param {string} subject
 *@param {string} Text
 *@param {string} [html]
 */

 function sendmail({to,subject,text,html}){
  const mailDetails={
    from:process.env.Email_USERS,
    to,subject,text,html
  };
  return mail.sendMail(mailDetails);
 }
  export {sendmail}