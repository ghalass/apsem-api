const express = require('express')

// controller functions
const {
    get_byengin_and_date,

    createSaisieHrm,
    updateSaisieHrm,

    createSaisieHim,
    deleteSaisieHim,
    updateSaisieHim,

    getSaisieHrm,
    getSaisieHrmDay,

}
    = require('../controllers/saisiehrmController')

const requireAuth = require('../middleware/requireAuth')
const allowedRoles = require('../middleware/allowedRoles')

const router = express.Router()

// require auth for all routes bellow
router.use(requireAuth)

router.post('/getSaisieHrm', getSaisieHrm)
router.post('/createSaisieHrm', allowedRoles(['SUPER_ADMIN', 'ADMIN', 'AGENT_SAISIE']), createSaisieHrm)
router.patch('/updateSaisieHrm', allowedRoles(['SUPER_ADMIN', 'ADMIN', 'AGENT_SAISIE']), updateSaisieHrm)

router.post('/createSaisieHim', allowedRoles(['SUPER_ADMIN', 'ADMIN', 'AGENT_SAISIE']), createSaisieHim)
router.delete('/deleteSaisieHim', allowedRoles(['SUPER_ADMIN', 'ADMIN', 'AGENT_SAISIE']), deleteSaisieHim)
router.patch('/updateSaisieHim', allowedRoles(['SUPER_ADMIN', 'ADMIN', 'AGENT_SAISIE']), updateSaisieHim)
router.post('/getSaisieHrmDay', getSaisieHrmDay)


router.post('/byengin_and_date', get_byengin_and_date)

module.exports = router