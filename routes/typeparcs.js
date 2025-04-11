const express = require('express')

// controller functions
const {
    createTypeparc,
    getTypeparcs,
    getTypeparc,
    deleteTypeparc,
    updateTypeparc
} = require('../controllers/typeparcController')

const requireAuth = require('../middleware/requireAuth')
const allowedRoles = require('../middleware/allowedRoles')

const router = express.Router()

// require auth for all routes bellow
router.use(requireAuth)

router.get('/', getTypeparcs)

// GET single workout
router.get('/:id', getTypeparc)

// POST a new workout
router.post('/', allowedRoles(['SUPER_ADMIN', 'ADMIN']), createTypeparc)

// UPDATE a workout
router.patch('/:id', allowedRoles(['SUPER_ADMIN', 'ADMIN']), updateTypeparc)

// DELETE a workout
router.delete('/:id', allowedRoles(['SUPER_ADMIN', 'ADMIN']), deleteTypeparc)


module.exports = router