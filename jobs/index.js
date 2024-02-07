const mailer = require('../services/mailer');

exports.sendMail = async (job) => {
  try {
    const { 
      template,
      lang,
      subject,
      to,
      url 
    } = job.attrs.data;

    const html = await mailer.renderEmailHtml(template, lang, {
      subject,
      url
    });
    
    // send email now
    console.log('Sending email to: ', to);
    await mailer.sendNow(to, subject, html)
  } catch (error) {
    console.error(error);
  }
}

