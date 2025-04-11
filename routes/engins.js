const express = require('express')

// controller functions
const {
    createEngin,
    getEngins,
    getEngin,
    deleteEngin,
    updateEngin,
    getEnginByParcId,
    getEnginsByParcIdSiteId,
} = require('../controllers/enginController')

const requireAuth = require('../middleware/requireAuth')
const allowedRoles = require('../middleware/allowedRoles')

const router = express.Router()

// require auth for all routes bellow
router.use(requireAuth)

router.get('/', getEngins)

// GET single workout
router.get('/:id', getEngin)

// GET single workout
router.get('/byparcid/:id', getEnginByParcId)

router.get('/parc/:parcId/site/:siteId', getEnginsByParcIdSiteId)

// POST a new workout
router.post('/', allowedRoles(['SUPER_ADMIN', 'ADMIN']), createEngin)

// UPDATE a workout
router.patch('/:id', allowedRoles(['SUPER_ADMIN', 'ADMIN']), updateEngin)

// DELETE a workout
router.delete('/:id', allowedRoles(['SUPER_ADMIN', 'ADMIN']), deleteEngin)


module.exports = router