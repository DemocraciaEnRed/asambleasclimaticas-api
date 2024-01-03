const Article = require('../models/article');
const Comment = require('../models/comment');

// exports.count = async (projectId) => {
//   try {
//     const articlesCount = await Article.countDocuments({project: projectId, deletedAt: null});
//     return articlesCount;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }

// // Not in use currently...
// // If you're going to use it, you should attach if the current user has liked or disliked the article
// exports.get = async (projectId, currentUserId = null) => {
//   try {
//     const articles = await Article.find({project: projectId, deletedAt: null}).sort({order: 1});
//     // for each article, get the comments
//     for (let i = 0; i < articles.length; i++) {
//       const article = articles[i];
//       const comments = await CommentHelper.get(projectId, article._id)
//       article.comments = comments;
//       const likedAndDisliked = await article.getIfLikedOrDislikedByUser(currentUserId);
//       article.liked = likedAndDisliked.liked;
//       article.disliked = likedAndDisliked.disliked;
//     }
//     return articles;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }

// exports.delete = async (projectId, articleId) => {
//   try {
//     const article = await Article.findById(articleId);
//     article.deletedAt = new Date();
//     await article.save();
//     return article;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }

exports.getArticleCurrentStats = async (projectId, articleId) => {
  try {
    const likes = 0                   // how many likes the article had when this version ended
    const dislikes = 0                // how many dislikes the article had when this version ended
    const comments = 0                // how many comments the article had when this version ended
    const replies = 0                 // how many replies the article had when this version ended
    const commentsLikes = 0           // how many likes the comments had when this version ended
    const commentsDislikes = 0        // how many dislikes the comments had when this version ended
    const repliesLikes = 0            // how many likes the replies had when this version ended
    const repliesDislikes = 0         // how many dislikes the replies had when this version ended
    const uniqueUsers = 0             // how many unique users interacted with the article when this version ended
    const highlightedComments = 0     // how many comments were highlighted when this version ended
    const resolvedComments = 0        // how many comments were resolved when this version ended
    const uniqueUsersPerCountry = {   // how many unique users per country interacted with the article when this version ended
      AR: 0,
      BR: 0,
      CL: 0,
    }
    
    const article = Article.findById(articleId);

    const articleStats = {
      likes,
      dislikes,
      comments,
      replies,
      commentsLikes,
      commentsDislikes,
      repliesLikes,
      repliesDislikes,
      uniqueUsers,
      highlightedComments,
      resolvedComments,
      uniqueUsersPerCountry,
    }

    return articleStats;
  } catch (error) {
    console.error(error);
    throw error;
  }
}