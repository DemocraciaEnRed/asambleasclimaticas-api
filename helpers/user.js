
const User = require('../models/user');

const publicProjection = {
  __v: false,
  password: false,
  resetPasswordToken: false,
  resetPasswordExpires: false,
  createdAt: false,
  updatedAt: false,
  deletedAt: false,
  isVerified: false
};

exports.listUsers = async (page = 1, limit = 10, public) => {
  try {
    // get the users by page
    const users = await User.find({}, public ? publicProjection : {}).skip((page - 1) * limit).limit(limit);

    // get pagination metadata
    const total = await User.countDocuments(); // get total of users
    const pages = Math.ceil(total / limit); // round up to the next integer
    const nextPage = page < pages ? page + 1 : null; // if there is no next page, return null
    const prevPage = page > 1 ? page - 1 : null; // if there is no previous page, return null

    // return the users with pagination metadata
    return {
      users,
      page,
      pages,
      nextPage,
      prevPage
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}