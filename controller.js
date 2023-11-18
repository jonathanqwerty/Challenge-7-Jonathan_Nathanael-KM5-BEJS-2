const { users } = require("./model");
const utils = require("./utils");
const nodemailer = require("nodemailer");

require("dotenv").config();

module.exports = {
  register: async (req, res) => {
    try {
      const existEmail = await users.findFirst({
        where: {
          email: req.body.email,
        },
      });
      if (existEmail) {
        return res.status(409).json({
          message: "email alredy exist",
        });
      }
      const data = await users.create({
        data: {
          email: req.body.email,
          password: await utils.cryptPassword(req.body.password),
        },
      });
      return res.status(201).json({
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error,
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const findUser = await users.findFirst({
        where: {
          email: req.body.email,
        },
      });

      if (!findUser) {
        return res.render("error");
      }

      const bcryptToken = await utils.cryptPassword(
        req.body.email.replace(/\s+/g, "-")
      );
      await users.update({
        data: {
          resetPasswordToken: bcryptToken,
        },
        where: {
          id: findUser.id,
        },
      });

      const transporter = nodemailer.createTransport({
        pool: true,
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const resetPasswordLink = `http://localhost:${process.env.PORT}/set-password/${bcryptToken}`;
      const mailOption = {
        from: process.env.EMAIL_USER,
        to: req.body.email,
        subject: "Reset-Password",
        html: `<p>Click <a href="${resetPasswordLink}">here</a> to reset your password</p>`,
      };
      transporter.sendMail(mailOption, (error, info) => {
        if (error) {
          return res.render("error");
        }
        console.log("Email sent: " + info.response);
      });

      return res.render("success");
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error,
      });
    }
  },

  setPassword: async (req, res) => {
    try {
      const findUser = await users.findFirst({
        where: {
          resetPasswordToken: req.body.key,
        },
      });

      if (!findUser) {
        return res.render("error");
      }

      await users.update({
        data: {
          password: await utils.cryptPassword(req.body.password),
          resetPasswordToken: null,
        },
        where: {
          id: findUser.id,
        },
      });

      return res.render("success");
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error,
      });
    }
  },
};
