const express = require('express')

// controller functions
const { loginUser, signupUser, getByEmail, changePassword,
    getUsers, updateUser, refresh, deleteUser, logoutUser, checkToken,
    createSuperAdmin
} = require('../controllers/userController')

const requireAuth = require('../middleware/requireAuth')
const allowedRoles = require('../middleware/allowedRoles')

const router = express.Router()

// login route
router.post('/login', loginUser)

// logout route
router.post('/logout', logoutUser)

// CREATE A DEFAULT SUPER_ADMIN
router.get('/create_super_admin', createSuperAdmin)

// refresh route
router.post('/refresh', refresh)

// checktoken route
router.get('/checktoken', checkToken)

/*************************** REQUIRE AUTH FOR ALL ROUTES BELLOW ***************************/
router.use(requireAuth)

// get user route
router.post('/getByEmail', getByEmail)

// get user route
router.post('/changePassword', changePassword)

// GET ALL USERS
router.get('/users', getUsers)

// CREATE A NEW USER ==> ONLY ADMIN & SUPER_ADMIN ARE ALLOWRD
router.post('/signup', allowedRoles(['SUPER_ADMIN', 'ADMIN']), signupUser)

// UPDATE AN USER
router.patch('/updateUser', allowedRoles(['SUPER_ADMIN', 'ADMIN']), updateUser)

// DELETE AN USER
router.delete('/:id', allowedRoles(['SUPER_ADMIN', 'ADMIN']), deleteUser)

module.exports = router