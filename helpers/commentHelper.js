const dayjs = require('dayjs');
const Comment = require('../models/comment');
const mailer = require('../services/mailer');
const agenda = require('../services/agenda');

exports.sendNotificationCommentResolved = async (commentId) => {
  try {
    if(process.env.SEND_NOTIFICATIONS === 'false') {
      console.log('Notifications are disabled, skipping email');
      return;
    }

    const comment = await Comment.findById(commentId).populate({
      path: 'project',
      select: '_id title_es title_pt slug'
    }).populate({
      path: 'user',
      select: '_id name country lang email',
      populate: {
        path: 'country',
        select: '_id name code emoji unicode image'
      }
    })

    const data = {
      url: `${process.env.APP_URL}/pacto/${comment.project.slug}`,
      comment: {
        text: comment.text,
        createdAt: dayjs(comment.createdAt).format('DD/MM/YYYY HH:mm'),
      },
      user: {
        name: comment.user.name,
        email: comment.user.email,
        lang: comment.user.lang,
        country: {
          name: comment.user.country.name,
          code: comment.user.country.code,
          emoji: comment.user.country.emoji,
          unicode: comment.user.country.unicode,
          image: comment.user.country.image,
        }
      },
      project: {
        title_es: comment.project.title_es,
        title_pt: comment.project.title_pt,
        slug: comment.project.slug,
      }
    }

    console.log('Comment resolved, sending email to: ', comment.user.email)

    await agenda.schedule('in 1 minute', 'send-mail', {
      to: [comment.user.email],
      subject: 'Resurgentes ha visto su comentario',
      template: 'commentSeen',
      lang: comment.user.lang,
      data: data
    })

    return;

  } catch (error) {
    throw error;
  }
}

exports.sendNotificationCommentHighlighted = async (commentId) => {
  try {
    if(process.env.SEND_NOTIFICATIONS === 'false') {
      console.log('Notifications are disabled, skipping email');
      return;
    }

    const comment = await Comment.findById(commentId).populate({
      path: 'project',
      select: '_id title_es title_pt slug'
    }).populate({
      path: 'user',
      select: '_id name country lang email',
      populate: {
        path: 'country',
        select: '_id name code emoji unicode image'
      }
    })

    const data = {
      url: `${process.env.APP_URL}/pacto/${comment.project.slug}`,
      comment: {
        text: comment.text,
        createdAt: dayjs(comment.createdAt).format('DD/MM/YYYY HH:mm'),
      },
      user: {
        name: comment.user.name,
        email: comment.user.email,
        lang: comment.user.lang,
        country: {
          name: comment.user.country.name,
          code: comment.user.country.code,
          emoji: comment.user.country.emoji,
          unicode: comment.user.country.unicode,
          image: comment.user.country.image,
        }
      },
      project: {
        title_es: comment.project.title_es,
        title_pt: comment.project.title_pt,
        slug: comment.project.slug,
      }
    }

    console.log('Comment highlighted, sending email to: ', comment.user.email)

    await agenda.schedule('in 1 minute', 'send-mail', {
      to: [comment.user.email],
      subject: 'Resurgentes ha destacado su comentario',
      template: 'commentHighlighted',
      lang: comment.user.lang,
      data: data
    })

    return;

  } catch (error) {
    throw error;
  }
}

exports.sendNotificationCommentReplied = async (commentId, replyId) => {
  try {
    if(process.env.SEND_NOTIFICATIONS === 'false') {
      console.log('Notifications are disabled, skipping email');
      return;
    }

    const comment = await Comment.findById(commentId).populate({
      path: 'project',
      select: '_id title_es title_pt slug'
    }).populate({
      path: 'user',
      select: '_id name country lang email',
      populate: {
        path: 'country',
        select: '_id name code emoji unicode image'
      }
    })

    const reply = await Comment.findById(replyId).populate({
      path: 'user',
      select: '_id name country lang email',
      populate: {
        path: 'country',
        select: '_id name code emoji unicode image'
      }
    })

    const data = {
      url: `${process.env.APP_URL}/pacto/${comment.project.slug}`,
      comment: {
        text: comment.text,
        createdAt: dayjs(comment.createdAt).format('DD/MM/YYYY HH:mm'),
      },
      user: {
        name: comment.user.name,
        email: comment.user.email,
        lang: comment.user.lang,
        country: {
          name: comment.user.country.name,
          code: comment.user.country.code,
          emoji: comment.user.country.emoji,
          unicode: comment.user.country.unicode,
          image: comment.user.country.image,
        }
      },
      reply: {
        user: {
          name: reply.user.name,
          email: reply.user.email,
          lang: reply.user.lang,
          country: {
            name: reply.user.country.name,
            code: reply.user.country.code,
            emoji: reply.user.country.emoji,
            unicode: reply.user.country.unicode,
            image: reply.user.country.image,
          }
        },
        text: reply.text,
        createdAt: dayjs(reply.createdAt).format('DD/MM/YYYY HH:mm'),
      },
      project: {
        title_es: comment.project.title_es,
        title_pt: comment.project.title_pt,
        slug: comment.project.slug,
      }
    }

    console.log('Comment replied, sending email to: ', comment.user.email)

    await agenda.schedule('in 1 minute', 'send-mail', {
      to: [comment.user.email],
      subject: 'Nueva respuesta a su comentario',
      template: 'commentReplied',
      lang: comment.user.lang,
      data: data
    })

    return;
  } catch (error) {
    throw error;
  }
}