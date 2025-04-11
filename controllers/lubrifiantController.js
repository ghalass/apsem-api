const prisma = require('../prismaClient')

// get all
const getLubrifiants = async (req, res) => {
    try {
        const lubrifiants = await prisma.lubrifiant.findMany({
            orderBy: { name: 'asc' },
            include: {
                Typelubrifiant: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                LubrifiantParc: {
                    include: {
                        parc: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        // Transformation des données
        const formattedLubrifiants = lubrifiants.map(lub => ({
            id: lub.id,
            name: lub.name,
            typelubrifiant: lub.Typelubrifiant,
            parcs: lub.LubrifiantParc.map(lp => lp.parc)
        }));

        res.status(200).json(formattedLubrifiants);
    } catch (error) {
        res.status(500).json({
            error: "Error fetching lubrifiants",
            details: error.message
        });
    }
};

// get a single lubrifiant
const getLubrifiant = async (req, res) => {
    const { id } = req.params
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" });
        }

        const lubrifiant = await prisma.lubrifiant.findFirst({
            where: { id: parseInt(id) }
        });

        if (!lubrifiant) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        res.status(200).json(lubrifiant)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// create new lubrifiant
const createLubrifiant = async (req, res) => {
    try {
        const { name, typelubrifiantId } = req.body

        let emptyFields = [];

        if (!name) emptyFields.push('name')
        if (!typelubrifiantId) emptyFields.push('typelubrifiantId')

        if (emptyFields.length > 0) {
            return res.status(400).json({ error: 'Veuillez remplir tout les champs!', emptyFields })
        }
        const exists = await prisma.lubrifiant.findFirst({
            where: { name }
        });

        if (exists) {
            return res.status(400).json({ error: 'lubrifiant déjà utilisé' })
        }

        const lubrifiant = await prisma.lubrifiant.create({
            data: { name, typelubrifiantId: parseInt(typelubrifiantId) }
        })
        res.status(201).json(lubrifiant)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// delete a lubrifiant
const deleteLubrifiant = async (req, res) => {
    try {
        const { id } = req.params

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const lubrifiant = await prisma.lubrifiant.findFirst({
            where: { id: parseInt(id) }
        });

        if (!lubrifiant) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        await prisma.lubrifiant.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json(lubrifiant)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// update a lubrifiant
const updateLubrifiant = async (req, res) => {
    try {
        const { id } = req.params
        const { name, typelubrifiantId } = req.body

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }
        if (isNaN(typelubrifiantId) || parseInt(typelubrifiantId) != typelubrifiantId) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const lubrifiant = await prisma.lubrifiant.findFirst({
            where: { id: parseInt(id) }
        });

        // check if name not already exist
        const nameExist = await prisma.lubrifiant.findFirst({
            where: { name: name, id: { not: parseInt(id) } },

        });
        if (nameExist) {
            return res.status(400).json({ error: "Nom déjà utilisé!" })
        }

        if (!lubrifiant) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        const updatedWorkout = await prisma.lubrifiant.update({
            where: { id: parseInt(id) },
            data: { name, typelubrifiantId: parseInt(typelubrifiantId) }
        });

        res.status(200).json(updatedWorkout)

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const addParcToLubrifiant = async (req, res) => {
    const { parc_id, lubrifiant_id } = req.body;
    console.log(parc_id, lubrifiant_id);

    let emptyFields = [];

    if (!parc_id) emptyFields.push('Parc Id');
    if (!lubrifiant_id) emptyFields.push('lubrifiant Id');

    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Veuillez remplir tout les champs!', emptyFields });
    }

    try {
        // Check if the relationship already exists
        const existingRelation = await prisma.lubrifiantParc.findUnique({
            where: {
                parcId_lubrifiantId: {
                    parcId: parseInt(parc_id),
                    lubrifiantId: parseInt(lubrifiant_id)
                }
            }
        });

        if (existingRelation) {
            return res.status(409).json({
                error: "Ce Type panne est déjà affcté à ce parc."
            });
        }

        // Create new relationship - CORRECTED VERSION
        const updated = await prisma.lubrifiantParc.create({
            data: {
                parc: { connect: { id: parseInt(parc_id) } },
                lubrifiant: { connect: { id: parseInt(lubrifiant_id) } }
            },
            include: {
                parc: true,
                lubrifiant: true
            }
        });

        res.status(201).json(updated);
    } catch (error) {
        // Improved error handling
        if (error.code === 'P2025') {
            return res.status(404).json({
                error: "Parc ou lubrifiant introuvable. Vérifiez les IDs."
            });
        }
        res.status(400).json({ error: error.message });
    }
};

const deleteAffectationLubrifiant = async (req, res) => {
    const { parc_id, lubrifiant_id } = req.body;
    let emptyFields = [];

    if (!parc_id) emptyFields.push('Parc Id');
    if (!lubrifiant_id) emptyFields.push('lubrifiant Id');

    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Veuillez remplir tout les champs!', emptyFields });
    }

    try {
        // Check if record exists (using composite key format)
        const lubrifiant_parc = await prisma.lubrifiantParc.findUnique({
            where: {
                parcId_lubrifiantId: {
                    parcId: parseInt(parc_id),
                    lubrifiantId: parseInt(lubrifiant_id)
                }
            }
        });

        if (!lubrifiant_parc) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" });
        }

        // Delete using composite key format
        await prisma.lubrifiantParc.delete({
            where: {
                parcId_lubrifiantId: {
                    parcId: parseInt(parc_id),
                    lubrifiantId: parseInt(lubrifiant_id)
                }
            }
        });

        res.status(200).json(lubrifiant_parc);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllLubrifiantsByParcId = async (req, res) => {
    try {
        const { id } = req.params;

        const lubrifiants = await prisma.lubrifiant.findMany({
            where: {
                LubrifiantParc: {
                    some: {
                        parcId: parseInt(id)
                    }
                }
            },
            select: {
                id: true,
                name: true
            }
        });

        res.status(200).json(lubrifiants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createLubrifiant,
    getLubrifiants,
    getLubrifiant,
    deleteLubrifiant,
    updateLubrifiant,
    addParcToLubrifiant,
    deleteAffectationLubrifiant,
    getAllLubrifiantsByParcId,
}