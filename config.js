const config = {
  jwt: {
    SECRET: process.env.JWT_SECRET,
  },
  email: {
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
    FROM_EMAIL: process.env.AWS_FROM_EMAIL,
  },
  db: {
    DB_UN: process.env.MONGO_DB_UN,
    DB_PW: process.env.MONGO_DB_PW,
  },
};

module.exports = {
  ...config,
};
