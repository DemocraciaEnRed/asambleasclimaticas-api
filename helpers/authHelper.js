const mailer = require('../services/mailer');
const agenda = require('../services/agenda');
/**
 * Send a verification email to the user
 * @param {Object} user - the user object
 * @param {String} token - the token to send to the email user
 */
exports.sendSignupEmail = async (user, url) => {
  try {
    await agenda.now('send-mail', {
			to: [user.email],
			subject: user.lang === 'pt' ? "Confirme seu registro" : "Confirmá tu registro",
			template: "signup",
      lang: user.lang,
      data: {
        url: url
      }
		})
  } catch (error) {
    throw error;
  }
}

/**
 * Send a verification email to the user
 * @param {Object} user - the user object
 * @param {String} token - the token to send to the email user
 */
exports.sendVerificationEmail = async (user, url) => {
  try {
    await agenda.now('send-mail', {
      to: [user.email],
			subject: user.lang === 'pt' ? "Verifique seu email" : "Verifica tu email",
			template: "verify",
      lang: user.lang,
      data: {
        url: url
      }
		})
  } catch (error) {
    throw error;
  }
}


exports.sendPasswordResetEmail = async (user, url) => {
  try {
    await agenda.now('send-mail', {
      to: [user.email],
      subject: user.lang === 'pt' ? "Redefinir sua senha" : "Restablecer tu contraseña",
      template: "reset",
      lang: user.lang,
      data: {
        url: url
      }
    })
  } catch (error) {
    throw error;
  }
}
