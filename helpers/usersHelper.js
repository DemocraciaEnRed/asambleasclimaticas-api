
const User = require('../models/user');

const publicSelect = {
  __v: false,
  email: false,
  password: false,
  resetPasswordToken: false,
  resetPasswordExpires: false,
  createdAt: false,
  updatedAt: false,
  deletedAt: false,
  isVerified: false
};

const privateSelect = {
  password: false,
  __v: false,
};

const queryForEnabledUsers = {
  deletedAt: {
    $or: [null, { $exists: false }]
  }
}

const queryForEveryUser = {}


exports.listUsers = async (page = 1, limit = 10, extraQuery = null, public = true, includeDeleted = false) => {
  try {
    let query = queryForEnabledUsers;
    if(!includeDeleted) {
      query = queryForEveryUser;
    }
    if(extraQuery) {
      query = {...query, ...extraQuery};
    }
    // get the users by page
    const users = await User.find(query, public ? publicSelect : privateSelect).populate('country').skip((page - 1) * limit).limit(limit);

    // get pagination metadata
    const total = await User.countDocuments(query);
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