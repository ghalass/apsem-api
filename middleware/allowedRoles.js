const allowedRoles = (roles) => {
    return (req, res, next) => {
        // GET USER ROLE FROM REQUEST
        const userROLE = req?.user?.role;

        const allowedRoleInString = roles.reduce((acc, role) => acc.replace('_', ' ') + ", " + role.replace('_', ' '))

        const msg = `ACCÈS REFUSÉ, AUTORISÉ UNIQUEMENT : [${allowedRoleInString}], ET VOUS ÊTES [${userROLE.replace('_', ' ')}]`

        // CHECK IF USER ROLE INCLUDE IN ALLOWRD ROLES
        if (!roles.includes(userROLE)) return res.status(403).send({ error: msg })

        next()
    }
}

module.exports = allowedRoles