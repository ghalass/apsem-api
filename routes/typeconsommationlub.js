const express = require('express')

// controller functions
const {
    createTypeconsommationlub,
    getTypeconsommationlub,
    getTypeconsommationlubs,
    deleteTypeconsommationlub,
    updateTypeconsommationlub,
    addParcToCodeTypeconsommationlub,
    deleteAffectationCodeToParc,
    getAllTypeconsommationlubsByParcId
} = require('../controllers/typeconsommationlubController')

const requireAuth = require('../middleware/requireAuth')
const allowedRoles = require('../middleware/allowedRoles')

const router = express.Router()

// require auth for all routes bellow
router.use(requireAuth)

router.get('/', getTypeconsommationlubs)

// GET single workout
router.get('/:id', getTypeconsommationlub)

// POST a new workout
router.post('/', allowedRoles(['SUPER_ADMIN', 'ADMIN']), createTypeconsommationlub)

// UPDATE a workout
router.patch('/:id', allowedRoles(['SUPER_ADMIN', 'ADMIN']), updateTypeconsommationlub)

// DELETE a workout
router.delete('/:id', allowedRoles(['SUPER_ADMIN', 'ADMIN']), deleteTypeconsommationlub)

router.post('/affectparctocode', allowedRoles(['SUPER_ADMIN', 'ADMIN']), addParcToCodeTypeconsommationlub)
router.delete('/affectparctocode/delete', allowedRoles(['SUPER_ADMIN', 'ADMIN']), deleteAffectationCodeToParc)
router.get('/affectparctocode/byparcid/:id', getAllTypeconsommationlubsByParcId)

module.exports = router