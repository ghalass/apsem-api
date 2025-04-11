const prisma = require('../prismaClient')

// get all
const getTypeconsommationlubs = async (req, res) => {
    try {
        // First get all Typeconsommationlub with their related Parcs
        const typeconsommationlubs = await prisma.typeconsommationlub.findMany({
            include: {
                parcs: {
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
        res.status(200).json(typeconsommationlubs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// get a single typepanne
const getTypeconsommationlub = async (req, res) => {
    const { id } = req.params
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" });
        }

        const typeconsommationlub = await prisma.typeconsommationlub.findFirst({
            where: { id: parseInt(id) }
        });

        if (!typeconsommationlub) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        res.status(200).json(typeconsommationlub)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// create new typepanne
const createTypeconsommationlub = async (req, res) => {
    const { name } = req.body

    let emptyFields = [];

    if (!name) emptyFields.push('name')

    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Veuillez remplir tout les champs!', emptyFields })
    }

    try {
        const exists = await prisma.typeconsommationlub.findFirst({
            where: { name: name }
        });

        if (exists) {
            return res.status(400).json({ error: 'Nom déjà utilisé' })
        }

        const updated = await prisma.typeconsommationlub.create({
            data: { name }
        })
        res.status(201).json(updated)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// delete a typepanne
const deleteTypeconsommationlub = async (req, res) => {
    const { id } = req.params
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const typeconsommationlub = await prisma.typeconsommationlub.findFirst({
            where: { id: parseInt(id) }
        });

        if (!typeconsommationlub) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        // check if typeconsommationlub has typeconsommationlub_parc
        const typeconsommationlub_parc = await prisma.typeconsommationlubParc.findFirst({
            where: { typeconsommationlubId: parseInt(id) }
        });
        if (typeconsommationlub_parc) {
            return res.status(405).json({ error: "Impossible de supprimer cet élément car il est référencé ailleurs." })
        }

        await prisma.typeconsommationlub.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json(typeconsommationlub_parc)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// update a typepanne
const updateTypeconsommationlub = async (req, res) => {
    const { id } = req.params
    const { name } = req.body

    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const typeconsommationlub = await prisma.typeconsommationlub.findFirst({
            where: { id: parseInt(id) }
        });

        // check if name not already exist
        const nameExist = await prisma.typeconsommationlub.findFirst({
            where: { name: name, id: { not: parseInt(id) } },

        });
        if (nameExist) {
            return res.status(400).json({ error: "Nom déjà utilisé!" })
        }

        if (!typeconsommationlub) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        const updated = await prisma.typeconsommationlub.update({
            where: { id: parseInt(id) },
            data: { name }
        });

        res.status(200).json(updated)

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// create new typepanne
const addParcToCodeTypeconsommationlub = async (req, res) => {
    const { parc_id, typeconsommationlub_id } = req.body;
    let emptyFields = [];

    if (!parc_id) emptyFields.push('Parc Id');
    if (!typeconsommationlub_id) emptyFields.push('Typeconsommationlub Id');

    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Veuillez remplir tout les champs!', emptyFields });
    }

    try {
        // Check if the relationship already exists
        const existingRelation = await prisma.typeconsommationlubParc.findUnique({
            where: {
                parcId_typeconsommationlubId: {
                    parcId: parseInt(parc_id),
                    typeconsommationlubId: parseInt(typeconsommationlub_id)
                }
            }
        });

        if (existingRelation) {
            return res.status(409).json({
                error: "Ce code est déjà affcté à ce parc."
            });
        }

        // Create new relationship - CORRECTED VERSION
        const updated = await prisma.typeconsommationlubParc.create({
            data: {
                parc: { connect: { id: parseInt(parc_id) } },
                typeconsommationlub: { connect: { id: parseInt(typeconsommationlub_id) } }
            },
            include: {
                parc: true,
                typeconsommationlub: true
            }
        });

        res.status(201).json(updated);
    } catch (error) {
        // Improved error handling
        if (error.code === 'P2025') {
            return res.status(404).json({
                error: "Parc ou Typeconsommationlub introuvable. Vérifiez les IDs."
            });
        }
        res.status(400).json({ error: error.message });
    }
};

const deleteAffectationCodeToParc = async (req, res) => {
    const { parc_id, typeconsommationlub_id } = req.body;
    let emptyFields = [];

    if (!parc_id) emptyFields.push('Parc Id');
    if (!typeconsommationlub_id) emptyFields.push('Typeconsommationlub Id');

    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Veuillez remplir tout les champs!', emptyFields });
    }

    try {
        // Check if record exists (using composite key format)
        const typeconsommationlub_parc = await prisma.typeconsommationlubParc.findUnique({
            where: {
                parcId_typeconsommationlubId: {
                    parcId: parseInt(parc_id),
                    typeconsommationlubId: parseInt(typeconsommationlub_id)
                }
            }
        });

        if (!typeconsommationlub_parc) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" });
        }

        // Delete using composite key format
        await prisma.typeconsommationlubParc.delete({
            where: {
                parcId_typeconsommationlubId: {
                    parcId: parseInt(parc_id),
                    typeconsommationlubId: parseInt(typeconsommationlub_id)
                }
            }
        });

        res.status(200).json(typeconsommationlub_parc);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllTypeconsommationlubsByParcId = async (req, res) => {
    try {
        const { id } = req.params;

        const typeconsommationlubs = await prisma.typeconsommationlub.findMany({
            where: {
                parcs: {
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

        res.status(200).json(typeconsommationlubs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createTypeconsommationlub,
    getTypeconsommationlub,
    getTypeconsommationlubs,
    deleteTypeconsommationlub,
    updateTypeconsommationlub,
    addParcToCodeTypeconsommationlub,
    deleteAffectationCodeToParc,
    getAllTypeconsommationlubsByParcId,
}