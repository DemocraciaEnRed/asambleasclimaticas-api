const mailer = require('../services/mailer');

exports.sendMail = async (job) => {
  try {
    const { 
      to,
      subject,
      template,
      lang,
      data,
    } = job.attrs.data;

    const html = await mailer.renderEmailHtml(template, lang, data);
    
    // send email now
    console.log('Sending email to: ', to);
    await mailer.sendNow(to, subject, html)
  } catch (error) {
    console.error(error);
  }
}

