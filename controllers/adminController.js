const Project = require('../models/project');
const AdminHelper = require('../helpers/adminHelper');
const { AsyncParser } = require('@json2csv/node');

exports.listProjects = async (req, res) => {
  try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
    // get the projects
    const resData = await AdminHelper.listProjects(page, limit);
    // return the projects
    return res.status(200).json(resData);
  } catch (error){
		console.error(error)
		return res.status(500).json({ message: req.__('error.default') })
  }
}

exports.exportUsers = async (req, res) => {
  try {
    const users = await AdminHelper.listAllUsers();

    const data = [];
    for(let i = 0; i < users.length; i++) {
      const user = users[i];
      const userOutput = {
        _id: user._id,
        email: user.email,
        name: user.name,
        lang: user.lang,
        countryName: user.country.name,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt,
        
      }
      data.push(userOutput);
    }

    const dateNow = new Date();
    const filename = `users-${dateNow.getFullYear()}-${dateNow.getMonth()}-${dateNow.getDate()}-${dateNow.getHours()}-${dateNow.getMinutes()}-${dateNow.getSeconds()}.csv`;

    const opts = {}
    const transformOpts = {}
    const asyncOpts = {}
    const parser = new AsyncParser(opts, transformOpts, asyncOpts);

    const csv = await parser.parse(data).promise();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    return res.send(csv);
    
  } catch (error){
    console.error(error)
    return res.status(500).json({ message: req.__('error.default') })
  }
}