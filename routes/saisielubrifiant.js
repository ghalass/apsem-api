const express = require('express')

// controller functions
const {

    createSaisieLubrifiant,
    deleteSaisieLubrifiant,
    getallsaisielubbymonth,

}
    = require('../controllers/saisielubrifiantController')

const requireAuth = require('../middleware/requireAuth')
const allowedRoles = require('../middleware/allowedRoles')

const router = express.Router()

// require auth for all routes bellow
router.use(requireAuth)

router.post('/createSaisieLubrifiant', allowedRoles(['SUPER_ADMIN', 'ADMIN', 'AGENT_SAISIE']), createSaisieLubrifiant)
router.delete('/deleteSaisieLubrifiant', allowedRoles(['SUPER_ADMIN', 'ADMIN', 'AGENT_SAISIE']), deleteSaisieLubrifiant)
router.post('/getallsaisielubbymonth', getallsaisielubbymonth)



module.exports = router