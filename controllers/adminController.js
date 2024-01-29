const Project = require('../models/project');
const AdminHelper = require('../helpers/adminHelper');

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