const Project = require('../models/project');
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
    let likes = 0 // how many likes the article had when this version ended
    let dislikes = 0 // how many dislikes the article had when this version ended
    let comments = 0 // how many comments the article had when this version ended
    let commentsLikes = 0 // how many likes the article comments had when this version ended
    let commentsDislikes = 0 // how many dislikes the comments had when this version ended
    let commentsReplies = 0 // how many article comment replies the project had when this version ended
    let commentsRepliesLikes = 0 // how many likes the article comments replies had when this version ended
    let commentsRepliesDislikes = 0 // how many dislikes the article comment replies had when this version ended
    let commentsCreatedInVersion = 0 // how many article comments were created in this version
    let commentsHighlightedInVersion = 0 // how many article comments were highlighted when this version ended
    let commentsResolvedInVersion = 0 // how many article comments were resolved when this version ended
    let uniqueUsersWhoInteracted = 0 // how many unique users interacted with the article when this version ended
    let uniqueUsersWhoInteractedPerCountry = {} // how many unique users interacted with the project when this version ended
    
    const project = await Project.findById(projectId);
    const article = await Article.findById(articleId);
    const currentVersion = project.version;

    likes = await article.getLikesCount();
    dislikes = await article.getDislikesCount();
    comments = await article.getCommentsCount();
    commentsLikes = await article.getCommentsLikesCount();
    commentsDislikes = await article.getCommentsDislikesCount();
    commentsReplies = await article.getCommentsRepliesCount();
    commentsRepliesLikes = await article.getCommentsRepliesLikesCount()
    commentsRepliesDislikes = await article.getCommentsRepliesDislikesCount()
    commentsCreatedInVersion = await article.getCommentsCreatedInVersionCount(currentVersion)
    commentsHighlightedInVersion = await article.getCommentsHighlightedInVersionCount(currentVersion)
    commentsResolvedInVersion = await article.getCommentsResolvedInVersionCount(currentVersion)

    const uniqueUsersWhoInteractedStats = await article.getUniqueUsersWhoInteracted();
    uniqueUsersWhoInteracted = uniqueUsersWhoInteractedStats.count
    uniqueUsersWhoInteractedPerCountry = uniqueUsersWhoInteractedStats.countPerCountry

    return {
      version: currentVersion,
      likes,
      dislikes,
      comments,
      commentsLikes,
      commentsDislikes,
      commentsReplies,
      commentsRepliesLikes,
      commentsRepliesDislikes,
      commentsCreatedInVersion,
      commentsHighlightedInVersion,
      commentsResolvedInVersion,
      uniqueUsersWhoInteracted,
      uniqueUsersWhoInteractedPerCountry
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}