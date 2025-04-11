const express = require('express')

// controller functions
const {
    createTypelubrifiant,
    getTypelubrifiant,
    // getTypepanne,
    deleteTypelubrifiant,
    updateTypelubrifiant
} = require('../controllers/typelubrifiantController')

const requireAuth = require('../middleware/requireAuth')
const allowedRoles = require('../middleware/allowedRoles')

const router = express.Router()

// require auth for all routes bellow
router.use(requireAuth)

router.get('/', getTypelubrifiant)

// // GET single workout
// router.get('/:id', getTypepanne)

// POST a new workout
router.post('/', allowedRoles(['SUPER_ADMIN', 'ADMIN']), createTypelubrifiant)

// UPDATE a workout
router.patch('/:id', allowedRoles(['SUPER_ADMIN', 'ADMIN']), updateTypelubrifiant)

// DELETE a workout
router.delete('/:id', allowedRoles(['SUPER_ADMIN', 'ADMIN']), deleteTypelubrifiant)


module.exports = router