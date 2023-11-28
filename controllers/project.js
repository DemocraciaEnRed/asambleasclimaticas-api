const Project = require('../models/project');
const ProjectHelper = require('../helpers/project');

exports.list = async (req, res) => {
  try {
		const page = req.query.page || 1;
		const limit = req.query.limit || 10;
		
    // get the projects
    const output = await Project.list(page, limit);

		return res.json(output);
  } catch (error){
    console.error(error)
    return res.status(500).json({message: error.message})
  }
}

exports.get = async (req, res) => {
  try{

  } catch (error) {
    console.error(error)
    return res.status(500).json({message: error.message})
  }
}

exports.toggleHide = async (req, res) => {
  try {
    // check if the user is an admin or the author of the project
    await ProjectHelper.canEdit(req.user, req.params.id)
    
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    project.hidden = !project.hidden;
    await project.save();
    // return OK status, no need to return the project
    return res.status(200)
  } catch (error) {
    console.error(error)
    return res.status(500).json({message: error.message})
  }
}