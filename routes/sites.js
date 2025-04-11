const express = require('express')

// controller functions
const {
    createSite,
    getSites,
    getSite,
    deleteSite,
    updateSite
} = require('../controllers/siteController')

const requireAuth = require('../middleware/requireAuth')
const allowedRoles = require('../middleware/allowedRoles')
// const verifyJWT = require('../middleware/verifyJWT')

const router = express.Router()

// require auth for all routes bellow
router.use(requireAuth)
// router.use(verifyJWT)

// GET all
router.get('/', getSites)

// GET single workout
router.get('/:id', getSite)

// POST a new workout
router.post('/', allowedRoles(['SUPER_ADMIN', 'ADMIN']), createSite)

// UPDATE a workout
router.patch('/:id', allowedRoles(['SUPER_ADMIN', 'ADMIN']), updateSite)

// DELETE a workout
router.delete('/:id', allowedRoles(['SUPER_ADMIN', 'ADMIN']), deleteSite)


module.exports = router