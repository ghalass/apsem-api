const express = require('express')

// controller functions
const {
    createTypepanne,
    getTypepannes,
    getTypepanne,
    deleteTypepanne,
    updateTypepanne,
    addParcToTypepanne,
    deleteAffectationTypepanne,
    getAllTypepannesByParcId
} = require('../controllers/typepanneController')

const requireAuth = require('../middleware/requireAuth')
const allowedRoles = require('../middleware/allowedRoles')

const router = express.Router()

// require auth for all routes bellow
router.use(requireAuth)

router.get('/', getTypepannes)

// GET single workout
router.get('/:id', getTypepanne)

// POST a new workout
router.post('/', allowedRoles(['SUPER_ADMIN', 'ADMIN']), createTypepanne)

// UPDATE a workout
router.patch('/:id', allowedRoles(['SUPER_ADMIN', 'ADMIN']), updateTypepanne)

// DELETE a workout
router.delete('/:id', allowedRoles(['SUPER_ADMIN', 'ADMIN']), deleteTypepanne)


router.post('/affectparctotypepanne', allowedRoles(['SUPER_ADMIN', 'ADMIN']), addParcToTypepanne)
router.delete('/affectparctotypepanne/delete', allowedRoles(['SUPER_ADMIN', 'ADMIN']), deleteAffectationTypepanne)
router.get('/affectparctotypepanne/byparcid/:id', getAllTypepannesByParcId)


module.exports = router