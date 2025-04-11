const express = require('express')

// controller functions
const {
    createPanne,
    getPannes,
    getPanne,
    deletePanne,
    updatePanne,
    fetchPannesByTypepanne,

} = require('../controllers/panneController')

const requireAuth = require('../middleware/requireAuth')
const allowedRoles = require('../middleware/allowedRoles')

const router = express.Router()

// require auth for all routes bellow
router.use(requireAuth)

router.get('/', getPannes)

// GET single workout
router.get('/:id', getPanne)

// GET single workout
router.get('/typepanne/:id', fetchPannesByTypepanne)

// POST a new workout
router.post('/', allowedRoles(['SUPER_ADMIN', 'ADMIN']), createPanne)

// UPDATE a workout
router.patch('/:id', allowedRoles(['SUPER_ADMIN', 'ADMIN']), updatePanne)

// DELETE a workout
router.delete('/:id', allowedRoles(['SUPER_ADMIN', 'ADMIN']), deletePanne)


module.exports = router