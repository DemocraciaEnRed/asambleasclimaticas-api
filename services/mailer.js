const nodemailer = require('nodemailer');
const agenda = require("agenda");
const nunjucks = require('nunjucks');
const path = require('path');

nunjucks.configure(path.join(__dirname, 'templates'), {
  autoescape: true,
  noCache: true,
});

const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASSWORD
  }
});

exports.sendNow = async (to, subject, html) => {
  try {
    let info = await transporter.sendMail({
      from: process.env.MAILER_FROM,
      to,
      subject,
      html
    });
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.log(error);
  }
}

exports.renderEmailHtml = async (template, lang, data) => {
  try {
    const language = lang || 'es';
    // Render the nunjucks template
    return nunjucks.render(`${language}/${template}.njk`, data);
  } catch (error) {
    throw error;
  }
}

exports.renderHtml = async (templatePath, data) => {
  try {
    // Render the nunjucks template
    return nunjucks.render(templatePath, data);
  } catch (error) {
    throw error;
  }
}

exports.sendLater = async (to, subject, html, when) => {
  try {
    let info = await agenda.schedule(when, 'send email', {
      to,
      subject,
      html
    });
    console.log('Job created: %s', info.attrs._id);
  } catch (error) {
    console.log(error);
  }
}
