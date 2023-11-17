const bcrypt = require("bcrypt");
const crypto = require("crypto");

const cryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(5);

  return bcrypt.hash(password, salt);
};

const generateResetToken = () => {
  const token = crypto.randomBytes(20).toString("hex");
  return token;
};

module.exports = {
  cryptPassword,
  generateResetToken,
};
