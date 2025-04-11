// routes/rapports.js
const express = require('express')

// controller functions
const {
    getRapportRje,
    getRapportUnitePhysique,
    getEtatMensuel,
    getIndispoParParc,
    getHeuresChassis,
    getSpecLub,
    getParetoIndispoParc,
    getParetoMtbfParc,
    getAnalyseSpcPeriodParcTypeConsomm,
    getIndispoParcPeriode,
    getIndispoEnginsPeriode,
    getPerormancesEnginsPeriode,
}
    = require('../controllers/rapportsController')

const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

// require auth for all routes bellow
router.use(requireAuth)

router.post('/getRapportRje', getRapportRje)
router.post('/getRapportUnitePhysique', getRapportUnitePhysique)
router.post('/getEtatMensuel', getEtatMensuel)
router.post('/getIndispoParParc', getIndispoParParc)
router.post('/getHeuresChassis', getHeuresChassis)
router.post('/getSpecLub', getSpecLub)
router.post('/getParetoIndispoParc', getParetoIndispoParc)
router.post('/getParetoMtbfParc', getParetoMtbfParc)
router.post('/getAnalyseSpcPeriodParcTypeConsomm', getAnalyseSpcPeriodParcTypeConsomm)
router.post('/getIndispoParcPeriode', getIndispoParcPeriode)
router.post('/getIndispoEnginsPeriode', getIndispoEnginsPeriode)
router.post('/getPerormancesEnginsPeriode', getPerormancesEnginsPeriode)

module.exports = router