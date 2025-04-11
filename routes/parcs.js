const express = require('express')

// controller functions
const {
    createParc,
    getParcs,
    getParc,
    deleteParc,
    updateParc,
    getParcsByTypeparc,
} = require('../controllers/parcController')

const requireAuth = require('../middleware/requireAuth')
const allowedRoles = require('../middleware/allowedRoles')

const router = express.Router()

// require auth for all routes bellow
router.use(requireAuth)

router.get('/', getParcs)

// GET single workout
router.get('/:id', getParc)

// GET single workout
router.get('/typeparc/:id', getParcsByTypeparc)

// POST a new workout
router.post('/', allowedRoles(['SUPER_ADMIN', 'ADMIN']), createParc)

// UPDATE a workout
router.patch('/:id', allowedRoles(['SUPER_ADMIN', 'ADMIN']), updateParc)

// DELETE a workout
router.delete('/:id', allowedRoles(['SUPER_ADMIN', 'ADMIN']), deleteParc)




module.exports = router