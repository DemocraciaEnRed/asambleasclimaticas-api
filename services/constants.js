// constants

module.exports = {
  ROLES: {
    ADMINISTRATOR: 'admin',
    AUTHOR: 'author',
    MODERATOR: 'moderator',
    USER: 'user',
    ADMIN_OR_AUTHOR: ['admin', 'author'],
    ADMIN_OR_AUTHOR_OR_MODERATOR: ['admin', 'author', 'moderator'],
    ALL: ['admin', 'author', 'moderator', 'user']
  },
  PROJECT_STAGES: ['MX', 'BR', 'CH', 'AR']
}