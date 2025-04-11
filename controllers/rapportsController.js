// controllers/rapportsController.js

const prisma = require('../prismaClient')

const getRapportRje = async (req, res) => {
    try {
        const { du } = req.body;  // Date donnée
        const dateCible = new Date(du);  // Convertir la date donnée en date JavaScript
        const debutMois = new Date(dateCible.getFullYear(), dateCible.getMonth(), 1);  // 1er jour du mois
        const debutAnnee = new Date(dateCible.getFullYear(), 0, 1);  // 1er jour de l'année

        // Période journalière (uniquement le jour donné)
        const nho_j = 24;  // 24 heures pour le jour donné
        const finJournee = new Date(dateCible.getTime() + 86400000);  // Fin de la journée (jour suivant)

        // Période mensuelle (du 1er jour du mois jusqu'au jour donné)
        const nho_m = dateCible.getDate() * 24;  // Nombre d'heures du 1er jour du mois jusqu'à la date donnée

        // Période annuelle (du 1er janvier jusqu'au jour donné)
        const joursEcoules = Math.floor((dateCible - debutAnnee) / 86400000) + 1;  // Nombre de jours écoulés dans l'année
        const nho_a = joursEcoules * 24;  // Nombre d'heures écoulées dans l'année

        // Fonction pour obtenir la somme des HIM, HRM et NI pour une période donnée et un engin donné
        const getHimHrmNi = async (enginId, startDate, endDate) => {
            const him = await prisma.saisiehim.aggregate({
                _sum: { him: true },
                where: {
                    Saisiehrm: {
                        du: { gte: startDate, lte: endDate },  // Filtre par période
                        enginId: enginId,  // Filtre par engin
                    },
                },
            });

            const hrm = await prisma.saisiehrm.aggregate({
                _sum: { hrm: true },
                where: {
                    du: { gte: startDate, lte: endDate },  // Filtre par période
                    enginId: enginId,  // Filtre par engin
                },
            });

            const ni = await prisma.saisiehim.count({
                where: {
                    Saisiehrm: {
                        du: { gte: startDate, lte: endDate },  // Filtre par période
                        enginId: enginId,  // Filtre par engin
                    },
                },
            });

            return {
                him: him._sum.him || 0,  // Somme des HIM pour la période
                hrm: hrm._sum.hrm || 0,  // Somme des HRM pour la période
                ni: ni || 0,  // Nombre d'interventions (NI) pour la période
            };
        };

        // Fonction pour calculer les indicateurs (dispo, mtbf, tdm)
        const calculateIndicators = (him, hrm, ni, nho) => {
            const dispo = ((1 - him / nho) * 100).toFixed(2);  // Disponibilité
            const mtbf = (hrm / ni).toFixed(2);  // MTBF
            const tdm = ((100 * hrm) / nho).toFixed(2);  // TDM

            return { dispo, mtbf, tdm };
        };

        // Récupérer tous les engins => uniquement les engins qui ont une saisie hrm
        const engins = await prisma.engin.findMany({
            where: {
                Saisiehrm: { some: {} } // Only engines that have at least one Saisiehrm entry
            },
            select: {
                id: true,
                name: true
            },
            distinct: ['name']
        });

        // Construire le tableau de résultats par engin
        const finalData = await Promise.all(
            engins.map(async (engin) => {
                // Calcul des sommes pour chaque période
                const [dataJ, dataM, dataA] = await Promise.all([
                    getHimHrmNi(engin.id, dateCible, finJournee),  // Période journalière
                    getHimHrmNi(engin.id, debutMois, dateCible),  // Période mensuelle
                    getHimHrmNi(engin.id, debutAnnee, dateCible),  // Période annuelle
                ]);

                // Calcul des indicateurs pour chaque période
                const indicatorsJ = calculateIndicators(dataJ.him, dataJ.hrm, dataJ.ni, nho_j);  // Journalier
                const indicatorsM = calculateIndicators(dataM.him, dataM.hrm, dataM.ni, nho_m);  // Mensuel
                const indicatorsA = calculateIndicators(dataA.him, dataA.hrm, dataA.ni, nho_a);  // Annuel

                return {
                    engin: engin.name,
                    // Période journalière
                    nho_j,
                    dispo_j: indicatorsJ.dispo,
                    mtbf_j: indicatorsJ.mtbf,
                    tdm_j: indicatorsJ.tdm,
                    him_j: dataJ.him,
                    hrm_j: dataJ.hrm,
                    ni_j: dataJ.ni,

                    // Période mensuelle
                    nho_m,
                    dispo_m: indicatorsM.dispo,
                    mtbf_m: indicatorsM.mtbf,
                    tdm_m: indicatorsM.tdm,
                    him_m: dataM.him,
                    hrm_m: dataM.hrm,
                    ni_m: dataM.ni,

                    // Période annuelle
                    nho_a,
                    dispo_a: indicatorsA.dispo,
                    mtbf_a: indicatorsA.mtbf,
                    tdm_a: indicatorsA.tdm,
                    him_a: dataA.him,
                    hrm_a: dataA.hrm,
                    ni_a: dataA.ni,
                };
            })
        );

        return res.status(200).json(finalData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};

const getRapportUnitePhysique = async (req, res) => {
    try {
        const { du } = req.body;  // Date donnée
        const dateCible = new Date(du);  // Convertir la date donnée en date JavaScript

        // Calcul des dates de début et de fin pour le mois en cours
        const debutMois = new Date(dateCible.getFullYear(), dateCible.getMonth(), 1);  // 1er jour du mois
        const finMois = new Date(dateCible.getFullYear(), dateCible.getMonth() + 1, 0);  // Dernier jour du mois

        // Calcul des dates de début et de fin pour l'année en cours
        const debutAnnee = new Date(dateCible.getFullYear(), 0, 1);  // 1er jour de l'année
        const finAnnee = new Date(dateCible.getFullYear(), 11, 31);  // Dernier jour de l'année

        // Récupérer tous les parcs avec leurs engins et les saisies HRM associées
        const parcs = await prisma.parc.findMany({
            include: {
                engins: {
                    include: {
                        Saisiehrm: {
                            where: {
                                OR: [
                                    { du: { gte: debutMois, lte: finMois } },  // Filtre pour le mois en cours
                                    { du: { gte: debutAnnee, lte: finAnnee } }  // Filtre pour l'année en cours
                                ]
                            },
                            include: {
                                Site: true,  // Inclure le site associé à la saisie HRM
                                Saisiehim: true  // Inclure les Saisiehim liées
                            }
                        }
                    }
                }
            }
        });

        // Calculer les données pour chaque parc
        const result = parcs.map(parc => {
            const allEngins = parc.engins;
            // GARDER QUE LES ENGINS QUI ONT UNE SAISIEHRM
            const engins = allEngins?.filter(e => e?.Saisiehrm?.length > 0);

            // Objet pour regrouper les données par site (basé sur Saisiehrm)
            const sitesData = {};

            engins.forEach(engin => {
                engin.Saisiehrm.forEach(saisie => {
                    const siteName = saisie.Site.name;

                    // Initialiser les données du site si nécessaire
                    if (!sitesData[siteName]) {
                        sitesData[siteName] = {
                            site: siteName,
                            hrm_m: 0,
                            him_m: 0,
                            hrm_a: 0,
                            him_a: 0
                        };
                    }

                    // Vérifier si la saisie est dans le mois en cours
                    if (saisie.du >= debutMois && saisie.du <= finMois) {
                        sitesData[siteName].hrm_m += saisie.hrm;
                        sitesData[siteName].him_m += saisie.Saisiehim.reduce((sum, him) => sum + him.him, 0);
                    }

                    // Vérifier si la saisie est dans l'année en cours
                    if (saisie.du >= debutAnnee && saisie.du <= finAnnee) {
                        sitesData[siteName].hrm_a += saisie.hrm;
                        sitesData[siteName].him_a += saisie.Saisiehim.reduce((sum, him) => sum + him.him, 0);
                    }
                });
            });

            // Convertir l'objet sitesData en tableau
            const par_site = Object.values(sitesData);

            // Calculer les totaux pour tous les sites
            const hrm_m_total = par_site.reduce((sum, site) => sum + site.hrm_m, 0);
            const him_m_total = par_site.reduce((sum, site) => sum + site.him_m, 0);
            const hrm_a_total = par_site.reduce((sum, site) => sum + site.hrm_a, 0);
            const him_a_total = par_site.reduce((sum, site) => sum + site.him_a, 0);

            return {
                parc: parc.name,
                nombre_d_engin: engins.length,
                par_site,  // Array of objects
                hrm_m_total,
                him_m_total,
                hrm_a_total,
                him_a_total
            };
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};

const getEtatMensuel = async (req, res) => {
    try {
        const { du } = req.body; // Date de référence

        // Convertir la date en objet Date
        const dateDu = new Date(du);

        // Calculer le premier et le dernier jour du mois
        const firstDayOfMonth = new Date(dateDu.getFullYear(), dateDu.getMonth(), 1);
        const lastDayOfMonth = new Date(dateDu.getFullYear(), dateDu.getMonth() + 1, 0);

        // Calculer le premier jour de l'année
        const firstDayOfYear = new Date(dateDu.getFullYear(), 0, 1);

        // Récupérer tous les parcs avec leurs engins et sites associés
        const parcs = await prisma.parc.findMany({
            include: {
                engins: {
                    include: {
                        Saisiehrm: {
                            where: {
                                du: {
                                    gte: firstDayOfYear, // On prend toutes les saisies depuis le début de l'année
                                    lte: lastDayOfMonth // Jusqu'à la fin du mois courant
                                }
                            },
                            include: {
                                Saisiehim: true // Charger les Saisiehim associées
                            }
                        }
                    }
                },
                Typeparc: true
            }
        });

        // Fonction pour calculer les indicateurs mensuels et annuels
        const calculateIndicators = (engins, periodStart, periodEnd) => {
            let nho = 0;
            let hrm = 0;
            let him = 0;
            let ni = 0;

            const enginsAvecSaisieDansPeriode = new Set();

            engins.forEach(engin => {
                if (engin.Saisiehrm && Array.isArray(engin.Saisiehrm)) {
                    const hasSaisieInPeriod = engin.Saisiehrm.some(saisie =>
                        saisie.du >= periodStart && saisie.du <= periodEnd
                    );

                    if (hasSaisieInPeriod) {
                        enginsAvecSaisieDansPeriode.add(engin.id); // ou engin.uuid si nécessaire
                    }

                    engin.Saisiehrm.forEach(saisie => {
                        if (saisie.du >= periodStart && saisie.du <= periodEnd) {
                            hrm += saisie.hrm;
                            if (saisie.Saisiehim && Array.isArray(saisie.Saisiehim)) {
                                saisie.Saisiehim.forEach(saisieHim => {
                                    him += saisieHim.him;
                                    ni += saisieHim.ni;
                                });
                            }
                        }
                    });
                }
            });

            const daysInPeriod = Math.floor((periodEnd - periodStart) / (1000 * 60 * 60 * 24)) + 1;
            nho = enginsAvecSaisieDansPeriode.size * 24 * daysInPeriod;

            const hrd = nho - (him + hrm);
            const mttr = ni > 0 ? him / ni : 0;
            const dispo = nho > 0 ? (1 - (him / nho)) * 100 : 0;
            const tdm = nho > 0 ? (hrm / nho) * 100 : 0;
            const mtbf = ni > 0 ? hrm / ni : 0;
            const util = (hrm + hrd) > 0 ? (hrm / (hrm + hrd)) * 100 : 0;

            return {
                nho: parseFloat(nho.toFixed(2)),
                hrm: parseFloat(hrm.toFixed(2)),
                him: parseFloat(him.toFixed(2)),
                ni: parseFloat(ni.toFixed(2)),
                hrd: parseFloat(hrd.toFixed(2)),
                mttr: parseFloat(mttr.toFixed(2)),
                dispo: parseFloat(dispo.toFixed(2)),
                tdm: parseFloat(tdm.toFixed(2)),
                mtbf: parseFloat(mtbf.toFixed(2)),
                util: parseFloat(util.toFixed(2)),
            };
        };


        // Formatage des données
        const result = parcs.map(parc => {
            const allEngins = parc.engins;
            // GARDER QUE LES ENGINS QUI ONT UNE SAISIEHRM
            const engins = allEngins?.filter(e => e?.Saisiehrm?.length > 0);
            // console.log(engins);

            const nombre_d_engin = engins.length;

            // Calcul des indicateurs mensuels
            const indicators_m = calculateIndicators(engins, firstDayOfMonth, lastDayOfMonth);

            // Calcul des indicateurs annuels
            const indicators_a = calculateIndicators(engins, firstDayOfYear, lastDayOfMonth);

            return {
                typeparc: parc.Typeparc.name,
                parc: parc.name,
                nombre_d_engin,
                // Indicateurs mensuels
                nho_m: indicators_m.nho,
                hrm_m: indicators_m.hrm,
                him_m: indicators_m.him,
                ni_m: indicators_m.ni,
                hrd_m: indicators_m.hrd,
                mttr_m: indicators_m.mttr,
                dispo_m: indicators_m.dispo,
                tdm_m: indicators_m.tdm,
                mtbf_m: indicators_m.mtbf,
                util_m: indicators_m.util,
                // Indicateurs annuels
                nho_a: indicators_a.nho,
                hrm_a: indicators_a.hrm,
                him_a: indicators_a.him,
                ni_a: indicators_a.ni,
                hrd_a: indicators_a.hrd,
                mttr_a: indicators_a.mttr,
                dispo_a: indicators_a.dispo,
                tdm_a: indicators_a.tdm,
                mtbf_a: indicators_a.mtbf,
                util_a: indicators_a.util,
            };
        });

        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};

const getIndispoParParc = async (req, res) => {
    try {
        const { du } = req.body; // Date de référence

        // Convertir la date en objet Date
        const dateDu = new Date(du);

        // Calculer le premier et le dernier jour du mois
        const firstDayOfMonth = new Date(dateDu.getFullYear(), dateDu.getMonth(), 1);
        const lastDayOfMonth = new Date(dateDu.getFullYear(), dateDu.getMonth() + 1, 0);

        firstDayOfMonth.setHours(0, 0, 0, 0);
        lastDayOfMonth.setHours(23, 59, 59, 999);

        // Calculer le premier jour de l'année
        const firstDayOfYear = new Date(dateDu.getFullYear(), 0, 1);
        firstDayOfYear.setHours(0, 0, 0, 0);

        // Récupérer tous les parcs avec leurs engins, sites et pannes associés
        const parcs = await prisma.parc.findMany({
            include: {
                engins: {
                    include: {
                        Site: true,
                        Saisiehrm: {
                            where: {
                                du: {
                                    gte: firstDayOfYear,
                                    lte: lastDayOfMonth
                                }
                            },
                            include: {
                                Saisiehim: {
                                    include: {
                                        Panne: true
                                    }
                                }
                            }
                        }
                    }
                },
                Typeparc: true
            }
        });

        // Fonction pour calculer les indicateurs par parc et par panne
        const calculateIndicators = (engins, periodStart, periodEnd) => {
            const result = {};
            let him_total = 0;
            const enginsAvecSaisieDansPeriode = new Set();

            engins.forEach(engin => {
                if (engin.Saisiehrm && Array.isArray(engin.Saisiehrm)) {
                    const hasSaisieInPeriod = engin.Saisiehrm.some(saisie =>
                        saisie.du >= periodStart && saisie.du <= periodEnd
                    );

                    if (hasSaisieInPeriod) {
                        enginsAvecSaisieDansPeriode.add(engin.id);
                    }

                    engin.Saisiehrm.forEach(saisie => {
                        if (saisie.du >= periodStart && saisie.du <= periodEnd) {
                            if (saisie.Saisiehim && Array.isArray(saisie.Saisiehim)) {
                                saisie.Saisiehim.forEach(saisieHim => {
                                    const panneName = saisieHim.Panne.name;

                                    if (!result[panneName]) {
                                        result[panneName] = {
                                            ni: 0,
                                            him: 0,
                                        };
                                    }

                                    result[panneName].ni += saisieHim.ni;
                                    result[panneName].him += saisieHim.him;
                                    him_total += saisieHim.him;
                                });
                            }
                        }
                    });
                }
            });

            return {
                result,
                him_total,
                activeEnginsCount: enginsAvecSaisieDansPeriode.size
            };
        };

        const result = [];

        parcs.forEach(parc => {
            const allEngins = parc.engins;
            const engins = allEngins?.filter(e => e?.Saisiehrm?.length > 0);
            const nombre_d_engin = engins.length;

            const {
                result: indicators_m,
                him_total: him_total_m,
                activeEnginsCount: activeEngins_m
            } = calculateIndicators(engins, firstDayOfMonth, lastDayOfMonth);

            const {
                result: indicators_a,
                him_total: him_total_a,
                activeEnginsCount: activeEngins_a
            } = calculateIndicators(engins, firstDayOfYear, lastDayOfMonth);

            const daysInMonth = Math.floor((lastDayOfMonth - firstDayOfMonth) / (1000 * 60 * 60 * 24)) + 1;
            const daysInYear = Math.floor((lastDayOfMonth - firstDayOfYear) / (1000 * 60 * 60 * 24)) + 1;

            const nho_m = 24 * activeEngins_m * daysInMonth;
            const nho_a = 24 * activeEngins_a * daysInYear;

            Object.keys(indicators_m).forEach(panne => {
                const him_m = indicators_m[panne].him;
                const him_a = indicators_a[panne]?.him ?? 0;
                const ni_m = indicators_m[panne].ni;
                const ni_a = indicators_a[panne]?.ni ?? 0;

                const indisp_m = nho_m ? (him_m / nho_m) * 100 : 0;
                const indisp_a = nho_a ? (him_a / nho_a) * 100 : 0;
                const coef_indispo_m = him_total_m ? (him_m / him_total_m) * 100 : 0;
                const coef_indispo_a = him_total_a ? (him_a / him_total_a) * 100 : 0;

                result.push({
                    typeparc: parc.Typeparc.name,
                    parc: parc.name,
                    panne: panne,
                    nombre_d_engin,
                    nho_m: parseFloat(nho_m.toFixed(2)),
                    nho_a: parseFloat(nho_a.toFixed(2)),
                    ni_m: parseFloat(ni_m.toFixed(2)),
                    ni_a: parseFloat(ni_a.toFixed(2)),
                    him_m: parseFloat(him_m.toFixed(2)),
                    him_a: parseFloat(him_a.toFixed(2)),
                    indisp_m: parseFloat(indisp_m.toFixed(2)),
                    indisp_a: parseFloat(indisp_a.toFixed(2)),
                    coef_indispo_m: parseFloat(coef_indispo_m.toFixed(2)),
                    coef_indispo_a: parseFloat(coef_indispo_a.toFixed(2)),
                });
            });
        });

        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};


const getHeuresChassis = async (req, res) => {
    try {
        const { du } = req.body; // Date de référence

        // Convertir la date en objet Date
        const dateDu = new Date(du);

        // Calculer le premier et le dernier jour du mois
        const firstDayOfMonth = new Date(dateDu.getFullYear(), dateDu.getMonth(), 1);
        const lastDayOfMonth = new Date(dateDu.getFullYear(), dateDu.getMonth() + 1, 0);

        // Récupérer tous les engins avec leurs parcs, sites et saisies associées
        const engins = await prisma.engin.findMany({
            include: {
                Parc: {
                    include: {
                        Typeparc: true // Inclure le type de parc
                    }
                },
                Site: true, // Inclure le site associé
                Saisiehrm: true // Inclure toutes les saisies hrm de l'engin
            }
        });

        // Formatage des données
        const result = engins.map(engin => {
            // Calcul de hrm_m (somme des hrm pour l'engin dans le mois)
            const hrm_m = engin.Saisiehrm
                .filter(saisie => saisie.du >= firstDayOfMonth && saisie.du <= lastDayOfMonth)
                .reduce((sum, saisie) => sum + saisie.hrm, 0);

            // Calcul de heuresChassis (somme de tous les hrm de l'engin + initialHeureChassis)
            const sommeHrmTotal = engin.Saisiehrm.reduce((sum, saisie) => sum + saisie.hrm, 0);
            const heuresChassis = sommeHrmTotal + (engin.initialHeureChassis || 0);

            return {
                typeparc: engin.Parc.Typeparc.name,
                parc: engin.Parc.name,
                engin: engin.name,
                hrm_m: parseFloat(hrm_m.toFixed(2)), // hrm_m limité à deux chiffres après la virgule
                heuresChassis: parseFloat(heuresChassis.toFixed(2)), // heuresChassis limité à deux chiffres après la virgule
                site: engin.Site.name
            };
        });

        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};

const getSpecLub = async (req, res) => {
    try {
        const { typelubrifiantId, year } = req.body;

        if (!typelubrifiantId || !year) {
            return res.status(400).json({
                message: "typelubrifiantId and year are required"
            });
        }

        const yearNum = parseInt(year);
        const startDate = new Date(yearNum, 0, 1);
        const endDate = new Date(yearNum + 1, 0, 1);

        const typelubrifiant = await prisma.typelubrifiant.findUnique({
            where: { id: parseInt(typelubrifiantId) }
        });

        if (!typelubrifiant) {
            return res.status(404).json({ message: "Typelubrifiant not found" });
        }

        const parcs = await prisma.parc.findMany({
            orderBy: { name: 'asc' },
            include: {
                engins: {
                    select: { id: true }
                }
            }
        });

        const result = await Promise.all(parcs.map(async (parc) => {
            const parcResult = {
                parc: parc.name,
                nombe_engin: parc.engins.length,
                typelubrifiantId: parseInt(typelubrifiantId),
                typelubrifiant: typelubrifiant.name,
                hrm_total: 0,
                qte_total: 0
            };

            for (let month = 1; month <= 12; month++) {
                parcResult[`hrm_${month}`] = 0;
                parcResult[`qte_${month}`] = 0;
                parcResult[`spec_${month}`] = 0;
            }

            const hrmByMonth = await prisma.saisiehrm.groupBy({
                by: ['du'],
                where: {
                    enginId: { in: parc.engins.map(e => e.id) },
                    du: {
                        gte: startDate,
                        lt: endDate
                    }
                },
                _sum: { hrm: true }
            });

            hrmByMonth.forEach(({ du, _sum }) => {
                const month = du.getMonth() + 1;
                parcResult[`hrm_${month}`] += _sum.hrm;
                parcResult.hrm_total += _sum.hrm;
            });

            const qteByMonth = await prisma.saisielubrifiant.findMany({
                where: {
                    Lubrifiant: { typelubrifiantId: parseInt(typelubrifiantId) },
                    Saisiehim: {
                        Saisiehrm: {
                            enginId: { in: parc.engins.map(e => e.id) },
                            du: {
                                gte: startDate,
                                lt: endDate
                            }
                        }
                    }
                },
                include: {
                    Saisiehim: {
                        include: {
                            Saisiehrm: {
                                select: { du: true }
                            }
                        }
                    }
                }
            });

            qteByMonth.forEach(({ qte, Saisiehim }) => {
                const month = Saisiehim.Saisiehrm.du.getMonth() + 1;
                parcResult[`qte_${month}`] += qte;
                parcResult.qte_total += qte;
            });

            // Formatage à 2 décimales pour toutes les valeurs
            for (let month = 1; month <= 12; month++) {
                const hrm = parcResult[`hrm_${month}`];
                const qte = parcResult[`qte_${month}`];
                const spec = hrm > 0 ? qte / hrm : 0;

                parcResult[`hrm_${month}`] = parseFloat(hrm.toFixed(2));
                parcResult[`qte_${month}`] = parseFloat(qte.toFixed(2));
                parcResult[`spec_${month}`] = parseFloat(spec.toFixed(2));
            }

            parcResult.hrm_total = parseFloat(parcResult.hrm_total.toFixed(2));
            parcResult.qte_total = parseFloat(parcResult.qte_total.toFixed(2));
            parcResult.spec_total = parcResult.hrm_total > 0
                ? parseFloat((parcResult.qte_total / parcResult.hrm_total).toFixed(2))
                : 0;

            return parcResult;
        }));

        res.json(result);

    } catch (error) {
        console.error("Error in getSpecLub:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const getParetoIndispoParc = async (req, res) => {
    try {
        const { parcId, date } = req.body;

        // Validation des paramètres
        if (!parcId || !date) {
            return res.status(400).json({
                message: "parcId and date are required"
            });
        }

        const inputDate = new Date(date);
        const year = inputDate.getFullYear();
        const month = inputDate.getMonth() + 1;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59); // Fin du dernier jour du mois

        // Calcul du nombre d'heures dans le mois
        const daysInMonth = new Date(year, month, 0).getDate();

        const hoursInMonth = daysInMonth * 24;

        const parc = await prisma.parc.findUnique({
            where: { id: parseInt(parcId) },
            include: {
                engins: {
                    where: {
                        Saisiehrm: {
                            some: {
                                du: {
                                    gte: startDate,
                                    lte: endDate
                                }
                            }
                        }
                    },
                    select: {
                        id: true,
                        name: true,
                        Saisiehrm: {
                            where: {
                                du: {
                                    gte: startDate,
                                    lte: endDate
                                }
                            }
                        }
                    },
                    orderBy: {
                        name: 'asc'
                    }
                }
            }
        });

        if (!parc) {
            return res.status(404).json({ message: "Parc not found" });
        }

        // Calcul du Nho (heures dans le mois * nombre d'engins)
        const nho = hoursInMonth * parc.engins.length;

        // Récupérer toutes les données pour le mois spécifié en une seule requête
        const records = await prisma.saisiehim.findMany({
            where: {
                Saisiehrm: {
                    enginId: { in: parc.engins.map(e => e.id) },
                    du: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            },
            select: {
                panneId: true,
                him: true,
                ni: true,
                enginId: true,
                Saisiehrm: {
                    select: {
                        enginId: true,
                        du: true
                    }
                }
            }
        });

        // Récupérer les noms des pannes
        const panneIds = [...new Set(records.map(r => r.panneId))];
        const pannes = await prisma.panne.findMany({
            where: { id: { in: panneIds } },
            select: { id: true, name: true }
        });
        const panneMap = new Map(pannes.map(panne => [panne.id, panne.name]));

        // Organiser les données par panne
        const dataByPanne = {};
        records.forEach(record => {
            const panneId = record.panneId;
            const enginId = record.enginId || record.Saisiehrm.enginId;
            const dateDu = record.Saisiehrm.du;

            // Vérifier que la date est bien dans le mois spécifié
            if (dateDu >= startDate && dateDu <= endDate) {
                if (!dataByPanne[panneId]) {
                    dataByPanne[panneId] = {
                        himTotal: 0,
                        niTotal: 0,
                        engins: {}
                    };
                }

                dataByPanne[panneId].himTotal += record.him;
                dataByPanne[panneId].niTotal += record.ni;

                if (!dataByPanne[panneId].engins[enginId]) {
                    dataByPanne[panneId].engins[enginId] = {
                        him: 0,
                        ni: 0
                    };
                }

                dataByPanne[panneId].engins[enginId].him += record.him;
                dataByPanne[panneId].engins[enginId].ni += record.ni;
            }
        });

        // Préparer le résultat final
        const result = Object.entries(dataByPanne).map(([panneId, data]) => {
            const enginsList = parc.engins
                .filter(engin => data.engins[engin.id]?.him > 0)
                .map(engin => ({
                    name: engin.name,
                    him: data.engins[engin.id].him
                }))
                .sort((a, b) => b.him - a.him);

            const enginsMtbfList = parc.engins
                .filter(engin => data.engins[engin.id]?.ni > 0)
                .map(engin => ({
                    name: engin.name,
                    ni: data.engins[engin.id].ni
                }))
                .sort((a, b) => b.ni - a.ni);

            const indispo = nho > 0 ? parseFloat(((100 * data.himTotal) / nho).toFixed(2)) : 0;

            return {
                parc: parc.name,
                year: year.toString(),
                month: month.toString(),
                nombe_engin: parc.engins.length,
                panne: panneMap.get(parseInt(panneId)) || 'Inconnue',
                indispo: indispo,
                engins: enginsList,
                engins_mtbf: enginsMtbfList
            };
        }).sort((a, b) => b.indispo - a.indispo); // Tri par indisponibilité décroissante

        res.json(result);

    } catch (error) {
        console.error("Error in getParetoIndispoParc:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const getParetoMtbfParc = async (req, res) => {
    try {
        const { parcId, date } = req.body;

        // Validation des entrées
        if (!parcId || !date) {
            return res.status(400).json({ error: "parcId et date sont obligatoires" });
        }

        const inputDate = new Date(date);
        const year = inputDate.getFullYear();

        // Récupération du parc avec tous ses engins (actifs et inactifs)
        const parc = await prisma.parc.findUnique({
            where: { id: parseInt(parcId) },
            include: {
                engins: {
                    select: {
                        id: true,
                        active: true
                    }
                }
            }
        });

        if (!parc) {
            return res.status(404).json({ error: "Parc non trouvé" });
        }

        // Noms des mois en français
        const monthNames = [
            "janvier", "février", "mars", "avril", "mai", "juin",
            "juillet", "août", "septembre", "octobre", "novembre", "décembre"
        ];

        // Préparer le résultat de base pour tous les mois
        const results = monthNames.map((monthName, index) => ({
            mois: monthName.slice(0, 3),
            mtbf: null,
            engins_actifs: 0
        }));

        // Filtrer seulement les engins actifs
        const activeEnginIds = parc.engins
            .filter(engin => engin.active)
            .map(engin => engin.id);

        // Si aucun engin actif, retourner le résultat vide
        if (activeEnginIds.length === 0) {
            return res.json(results);
        }

        // Traitement pour chaque mois de l'année
        for (let month = 0; month < 12; month++) {
            const monthStart = new Date(year, month, 1);
            const monthEnd = new Date(year, month + 1, 0);

            // Récupération des HRM (somme des hrm)
            const hrmResult = await prisma.saisiehrm.aggregate({
                where: {
                    enginId: { in: activeEnginIds },
                    du: { gte: monthStart, lte: monthEnd }
                },
                _sum: { hrm: true }
            });
            const hrm = hrmResult._sum.hrm || 0;

            // Récupération des NI (somme des ni)
            const niResult = await prisma.saisiehim.aggregate({
                where: {
                    Saisiehrm: {
                        enginId: { in: activeEnginIds },
                        du: { gte: monthStart, lte: monthEnd }
                    }
                },
                _sum: { ni: true }
            });
            const ni = niResult._sum.ni || 0;

            // Calcul du MTBF (avec 2 décimales)
            const mtbf = ni > 0 ? parseFloat((hrm / ni).toFixed(2)) : null;

            // Mise à jour du résultat pour le mois courant
            results[month] = {
                ...results[month],
                mtbf: mtbf,
                engins_actifs: activeEnginIds.length
            };
        }

        res.json(results);

    } catch (error) {
        console.error("Erreur dans getParetoMtbfParc:", error);
        res.status(500).json({
            error: "Erreur interne du serveur",
            details: error.message
        });
    }
};

const getAnalyseSpcPeriodParcTypeConsomm = async (req, res) => {
    try {
        const { parcId, dateDu, dateAu, typelubrifiantId } = req.body;

        const saisies = await prisma.saisielubrifiant.findMany({
            where: {
                Lubrifiant: {
                    typelubrifiantId: parseInt(typelubrifiantId),
                },
                Typeconsommationlub: {
                    parcs: {
                        some: {
                            parcId: parseInt(parcId),
                        },
                    },
                },
                Saisiehim: {
                    Saisiehrm: {
                        du: {
                            gte: new Date(dateDu),
                            lte: new Date(dateAu),
                        },
                        Engin: {
                            parcId: parseInt(parcId),
                        },
                    },
                },
            },
            include: {
                Typeconsommationlub: true,
            },
        });

        const grouped = {};
        let totalQte = 0;

        for (const s of saisies) {
            const name = s.Typeconsommationlub?.name || 'Non spécifié';
            grouped[name] = (grouped[name] || 0) + s.qte;
            totalQte += s.qte;
        }

        const result = Object.entries(grouped)
            .map(([name, sum]) => ({
                name,
                sum,
                percentage: totalQte ? parseFloat((sum / totalQte * 100).toFixed(2)) : 0,
            }))
            .sort((a, b) => b.percentage - a.percentage); // ✅ tri décroissant

        res.json(result);
    } catch (error) {
        console.error("Erreur dans getAnalyseSpcPeriodParcTypeConsomm", error);
        res.status(500).json({
            error: "Erreur interne du serveur",
            details: error.message,
        });
    }
};

const getIndispoParcPeriode = async (req, res) => {
    try {
        const { parcId, dateDu, dateAu } = req.body;

        if (!parcId || !dateDu || !dateAu) {
            return res.status(400).json({ error: "parcId, dateDu et dateAu sont requis" });
        }

        const parc = await prisma.parc.findUnique({
            where: { id: parseInt(parcId) },
            select: { name: true },
        });

        if (!parc) {
            return res.status(404).json({ error: "Parc non trouvé" });
        }

        const saisiehimList = await prisma.saisiehim.findMany({
            where: {
                Saisiehrm: {
                    du: {
                        gte: new Date(dateDu),
                        lte: new Date(dateAu),
                    },
                    Engin: {
                        parcId: parseInt(parcId),
                    },
                },
            },
            include: {
                Panne: {
                    select: {
                        name: true,
                        Typepanne: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                Saisiehrm: {
                    select: {
                        du: true,
                        Engin: {
                            select: {
                                id: true,
                                parcId: true,
                            },
                        },
                    },
                },
            },
        });

        const grouped = {};

        for (const item of saisiehimList) {
            const panneName = item.Panne?.name || 'Inconnu';
            const typepanneName = item.Panne?.Typepanne?.name || 'Inconnu';
            const key = `${typepanneName}||${panneName}`;

            if (!grouped[key]) {
                grouped[key] = {
                    dateDu,
                    dateAu,
                    parc: parc.name,
                    panne: panneName,
                    typepanne: typepanneName,
                    ni_m: 0,
                    ni_a: 0,
                    him_m: 0,
                    him_a: 0,
                };
            }

            grouped[key].ni_m += item.ni || 0;
            grouped[key].ni_a += item.ni || 0;
            grouped[key].him_m += item.him || 0;
            grouped[key].him_a += item.him || 0;
        }

        const result = Object.values(grouped).sort((a, b) => {
            if (a.typepanne === b.typepanne) {
                return a.panne.localeCompare(b.panne);
            }
            return a.typepanne.localeCompare(b.typepanne);
        });

        res.json(result);

    } catch (error) {
        console.error("Erreur dans getIndispoParcPeriode", error);
        res.status(500).json({
            error: "Erreur interne du serveur",
            details: error.message,
        });
    }
};

const getIndispoEnginsPeriode = async (req, res) => {
    try {
        const { parcId, dateDu, dateAu } = req.body;

        if (!parcId || !dateDu || !dateAu) {
            return res.status(400).json({ error: "parcId, dateDu et dateAu sont requis" });
        }

        const parc = await prisma.parc.findUnique({
            where: { id: parseInt(parcId) },
            select: { name: true },
        });

        if (!parc) {
            return res.status(404).json({ error: "Parc non trouvé" });
        }

        const saisiehimList = await prisma.saisiehim.findMany({
            where: {
                Saisiehrm: {
                    du: {
                        gte: new Date(dateDu),
                        lte: new Date(dateAu),
                    },
                    Engin: {
                        parcId: parseInt(parcId),
                    },
                },
            },
            include: {
                Panne: {
                    select: {
                        name: true,
                        Typepanne: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                Saisiehrm: {
                    select: {
                        du: true,
                        Engin: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        const grouped = {};

        for (const item of saisiehimList) {
            const panneName = item.Panne?.name || 'Inconnu';
            const typepanneName = item.Panne?.Typepanne?.name || 'Inconnu';
            const enginName = item.Saisiehrm.Engin?.name || 'Inconnu';

            const key = `${enginName}||${typepanneName}||${panneName}`;

            if (!grouped[key]) {
                grouped[key] = {
                    dateDu,
                    dateAu,
                    parc: parc.name,
                    engin: enginName,
                    panne: panneName,
                    typepanne: typepanneName,
                    ni_m: 0,
                    ni_a: 0,
                    him_m: 0,
                    him_a: 0,
                };
            }

            grouped[key].ni_m += item.ni || 0;
            grouped[key].ni_a += item.ni || 0;
            grouped[key].him_m += item.him || 0;
            grouped[key].him_a += item.him || 0;
        }

        const result = Object.values(grouped).sort((a, b) => {
            if (a.engin === b.engin) {
                if (a.typepanne === b.typepanne) {
                    return a.panne.localeCompare(b.panne);
                }
                return a.typepanne.localeCompare(b.typepanne);
            }
            return a.engin.localeCompare(b.engin);
        });

        res.json(result);

    } catch (error) {
        console.error("Erreur dans getIndispoEnginsPeriode", error);
        res.status(500).json({
            error: "Erreur interne du serveur",
            details: error.message,
        });
    }
};

const getPerormancesEnginsPeriode = async (req, res) => {
    try {
        const { parcId, dateDu, dateAu } = req.body;

        if (!parcId || !dateDu || !dateAu) {
            return res.status(400).json({ error: "parcId, dateDu et dateAu sont requis" });
        }

        const parc = await prisma.parc.findUnique({
            where: { id: parseInt(parcId) },
            select: { name: true },
        });

        if (!parc) {
            return res.status(404).json({ error: "Parc non trouvé" });
        }

        // Calcul du nombre de jours inclusivement
        const startDate = new Date(dateDu);
        const endDate = new Date(dateAu);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure les deux dates

        // Récupération des Saisiehrm avec leurs Saisiehim
        const saisiehrms = await prisma.saisiehrm.findMany({
            where: {
                du: {
                    gte: startDate,
                    lte: endDate,
                },
                Engin: {
                    parcId: parseInt(parcId),
                },
            },
            include: {
                Engin: true,
                Saisiehim: true,
            },
        });

        // Grouper par engin
        const grouped = {};

        for (const saisie of saisiehrms) {
            const enginName = saisie.Engin.name;

            if (!grouped[enginName]) {
                grouped[enginName] = {
                    dateDu,
                    dateAu,
                    parc: parc.name,
                    engin: enginName,
                    hrm: 0,
                    him: 0,
                    ni: 0,
                    nho: diffDays * 24, // total heures ouvertes = nb jours * 24
                };
            }

            grouped[enginName].hrm += saisie.hrm || 0;

            for (const him of saisie.Saisiehim) {
                grouped[enginName].him += him.him || 0;
                grouped[enginName].ni += him.ni || 0;
            }
        }

        // Calcul des performances
        const result = Object.values(grouped).map((e) => {
            const { hrm, him, ni, nho } = e;

            const dispo = nho > 0 ? 100 * (1 - him / nho) : 0;
            const tdm = nho > 0 ? 100 * (hrm / nho) : 0;
            const mtbf = ni > 0 ? hrm / ni : 0;
            const util = nho > him ? 100 * hrm / (nho - him) : 0;
            const hrd = nho - (him + hrm);

            return {
                ...e,
                hrm: hrm.toFixed(2),
                him: him.toFixed(2),
                ni: ni.toFixed(2),
                nho: nho.toFixed(2),
                dispo: dispo.toFixed(2),
                tdm: tdm.toFixed(2),
                mtbf: mtbf.toFixed(2),
                util: util.toFixed(2),
                hrd: hrd.toFixed(2),
            };
        });

        res.json(result);
    } catch (error) {
        console.error("Erreur dans getPerormancesEnginsPeriode", error);
        res.status(500).json({
            error: "Erreur interne du serveur",
            details: error.message,
        });
    }
};


module.exports = {
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
    getPerormancesEnginsPeriode
};