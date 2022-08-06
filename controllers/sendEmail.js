const config = require("../config");
const AWS = require("aws-sdk");
const HttpError = require("../models/http-error");
const nanoid = require("nanoid-esm");
// AWS.config.update({ region: `${config.email.AWS_REGION}` });

const awsConfig = {
  // accessKeyId: config.email.AWS_ACCESS_KEY,
  // secretKey: config.email.AWS_SECRET_KEY,
  // region: config.email.REGION,

  accessKeyId: `${config.email.AWS_ACCESS_KEY_ID}`,
  secretAccessKey: `${config.email.AWS_SECRET_KEY}`,
  region: `${config.email.AWS_REGION}`,
};

const SES = new AWS.SES(awsConfig);

const sendEmail = async (toEmail, password) => {
  const fromEmail = `${config.email.FROM_EMAIL}`;
  const tempPassword = password ? password : nanoid(8).toUpperCase();

  console.log(tempPassword);
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
          Data: "Your verification code",
        },
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `<h1>Your temporary password is ${tempPassword}</h2>`,
          },
        },
      },
    };
    await SES.sendEmail(params)
      .promise()
      .then((data) => {
        console.log("Email sent successfully", data.MessageId);
      })
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
