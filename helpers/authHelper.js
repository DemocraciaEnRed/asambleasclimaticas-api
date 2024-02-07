const mailer = require('../services/mailer');
const agenda = require('../services/agenda');
/**
 * Send a verification email to the user
 * @param {Object} user - the user object
 * @param {String} token - the token to send to the email user
 */
exports.sendVerificationEmail = async (user, url) => {
  try {
    await agenda.now('send-mail', {
			template: "signup",
      lang: user.lang,
			subject: "Confirma tu cuenta",
			to: [user.email],
			url: url
		})
  } catch (error) {
    throw error;
  }
}

exports.sendPasswordResetEmail = async (user, url) => {
  try {
    await agenda.now('send-mail', {
      template: "reset",
      lang: user.lang,
      subject: "Reseteá tu contraseña",
      to: [user.email],
      url: url
    })
  } catch (error) {
    throw error;
  }
}

// exports.renderSuccessVerification = async () => {
//   try {
    
//     // this function returns an html of the render of a njk template.
//     return mailer.renderHtml('/auth/successVerification.njk', {
//       appUrl: process.env.APP_URL,
//     });
//   } catch (error) {

//   }
// }

// exports.renderAlreadyVerified = async () => {
//   try {
//     return mailer.renderHtml('/auth/alreadyVerified.njk', {
//       appUrl: process.env.APP_URL,
//     });
//   } catch (error) {

//   }
// }

// exports.renderErrorVerification = async () => {
//   try {
//     return mailer.renderHtml('/auth/errorVerification.njk', {
//       appUrl: process.env.APP_URL,
//     });
//   } catch (error) {

//   }
// }

// exports.renderNotFoundToken = async () => {
//   try {
//     return mailer.renderHtml('/auth/noToken.njk', {
//       appUrl: process.env.APP_URL,
//     });
//   } catch (error) {

//   }
// }

// exports.renderNotFoundUser = async () => {
//   try {
//     return mailer.renderHtml('/auth/noUser.njk', {
//       appUrl: process.env.APP_URL,
//     });
//   } catch (error) {

//   }
// }