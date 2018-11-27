const ROLES = [
    "junior mod",
    "moderator",
    "mod",
    "admin",
    "administrator",
    "staff",
    "server mod"
];

module.exports = member => !member.roles.some(r => ROLES.includes(r.name.toLocaleLowerCase())) && !member.hasPermission("ADMINISTRATOR");