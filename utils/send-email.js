const config = require("../config");
const AWS = require("aws-sdk");
const HttpError = require("../models/http-error");
const nanoid = require("nanoid-esm");

const awsConfig = {
  accessKeyId: `${config.email.AWS_ACCESS_KEY_ID}`,
  secretAccessKey: `${config.email.AWS_SECRET_KEY}`,
  region: `${config.email.AWS_REGION}`,
};

const SES = new AWS.SES(awsConfig);

const sendEmail = async (toEmail, firstName, password, type) => {
  const fromEmail = `${config.email.FROM_EMAIL}`;
  const tempPassword = password ? password : nanoid(8).toUpperCase();

  let html = "",
    subject = "Your verification code";

  if (type === "new") {
    html = `<p> Hello! ${firstName}<br/><br/>
    Welcome to Light Finance Lk. Please use the following temporary password to login to your account.<br/><br/>
    Your temporary password is <strong>${tempPassword}</strong><br/><br/><br/>
    <small>Light Finance Lk (Pvt) Ltd, 310, Galle Road, Moratuwa, Sri Lanka. <a href="tel:+941121400765">+941121400765</a></small>
    <br/><br/></p>`;
  } else if (type === "reset") {
    html = `<p> Hello! ${firstName} <br/><br/>
    There is a request to change your password. If you are not interested in resetting your password please ignore this email.<br/>
    Please use the following temporary password to login to your account. <br/><br/>
    Your temporary password is <strong>${tempPassword}</strong><br/><br/><br/>
    <small>Light Finance Lk (Pvt) Ltd, 310, Galle Road, Moratuwa, Sri Lanka. <a href="tel:+941121400765">+941121400765</a></small>
    <br/><br/></p>`;
  } else if (type === "init") {
    html = `<p> Hello! ${firstName} <br/><br/>
    Your password is updated successfully. You can use new credentials from next login.<br/><br/><br/>
    <small>Light Finance Lk (Pvt) Ltd, 310, Galle Road, Moratuwa, Sri Lanka. <a href="tel:+941121400765">+941121400765</a></small>
    <br/><br/></p>`;
    subject = "Password is updated";
  } else if (type === "delete") {
    html = `<p> Hello! ${firstName} <br/><br/>
    Your account is terminated successfully. Thank you very much for being connected with Light Finance Lk. Wish you all the best in Personal Investing.<br/><br/><br/>
    <small>Light Finance Lk (Pvt) Ltd, 310, Galle Road, Moratuwa, Sri Lanka. <a href="tel:+941121400765">+941121400765</a></small>
    <br/><br/></p>`;
    subject = "Your account is terminated";
  }

  try {
    const params = {
      Source: fromEmail,
      Destination: {
        ToAddresses: [toEmail],
      },
      ReplyToAddresses: [],
      Message: {
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: html,
          },
        },
      },
    };
    await SES.sendEmail(params)
      .promise()
      .then((data) => {})
      .catch((err) => {
        const error = new HttpError("Error in sending Email", 500);
        console.log("error", err);
      });
  } catch (err) {
    const error = new HttpError("Error in sending Email", 500);
    console.log(err);
  }
};

exports.sendEmail = sendEmail;
