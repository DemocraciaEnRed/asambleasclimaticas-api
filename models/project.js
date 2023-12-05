const mongoose = require('mongoose');

const VersionSchema = new mongoose.Schema({
  about_es: {
    type: String,
    required: true
  },
  about_pt: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    required: true,
    default: 1
  },
}, {timestamps: true});

const EventsSchema = new mongoose.Schema({
  title_es: {
    type: String,
    required: true
  },
  title_pt: {
    type: String,
    required: true
  },
  text_es: {
    type: String,
    required: true
  },
  text_pt: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
}, {timestamps: true});

const ProjectSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title_es: {
    type: String,
    required: true
  },
  title_pt: {
    type: String,
    required: true
  },
  path_es: {
    type: String,
    required: true
  },
  path_pt: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    required: true,
    default: 1
  },
  about_es: {
    type: String,
    required: true
  },
  about_pt: {
    type: String,
    required: true
  },
  hidden: {
    type: Boolean,
    required: true,
    default: true // new projects are hidden by default
  },
  versions: [VersionSchema],
  events: [EventsSchema],
  closedAt: {
    type: Date
  },
  publishedAt: {
    type: Date
  },
}, {timestamps: true});

ProjectSchema.virtual('published').get(function() {
  return this.publishedAt !== undefined;
});

ProjectSchema.virtual('closed').get(function() {
  // if now is after endDate, project is closed
  if(this.closedAt === undefined) return false; // To check...
  return Date.now() > this.endDate;
});

ProjectSchema.virtual('versionsCount').get(function() {
  return this.versions.length;
})

ProjectSchema.virtual('eventCount').get(function() {
  return this.events.length;
})

module.exports = mongoose.model('Project', ProjectSchema);
