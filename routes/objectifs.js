const express = require('express')

// controller functions
const {
    createObjectif,
    getObjectifs,
    getObjectif,
    deleteObjectif,
    updateObjectif
} = require('../controllers/objectifController')

const requireAuth = require('../middleware/requireAuth')
const allowedRoles = require('../middleware/allowedRoles')
// const verifyJWT = require('../middleware/verifyJWT')

const router = express.Router()

// require auth for all routes bellow
router.use(requireAuth)
// router.use(verifyJWT)

// GET all
router.get('/', getObjectifs)

// GET single workout
router.get('/:id', getObjectif)

// POST a new workout
router.post('/', allowedRoles(['SUPER_ADMIN', 'ADMIN']), createObjectif)

// UPDATE a workout
router.patch('/:id', allowedRoles(['SUPER_ADMIN', 'ADMIN']), updateObjectif)

// DELETE a workout
router.delete('/:id', allowedRoles(['SUPER_ADMIN', 'ADMIN']), deleteObjectif)


module.exports = router