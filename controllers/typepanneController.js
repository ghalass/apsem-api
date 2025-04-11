const prisma = require('../prismaClient')

// get all
const getTypepannes = async (req, res) => {
    try {
        const typepannes = await prisma.typepanne.findMany({
            orderBy: { name: 'asc' },
            include: {
                TypepanneParc: {
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

        // Transform the data to a cleaner structure
        const formattedTypepannes = typepannes.map(typepanne => ({
            id: typepanne.id,
            name: typepanne.name,
            parcs: typepanne.TypepanneParc.map(tp => tp.parc)
        }));

        res.status(200).json(formattedTypepannes);
    } catch (error) {
        res.status(500).json({
            error: "Error fetching typepannes",
            details: error.message
        });
    }
}

// get a single typepanne
const getTypepanne = async (req, res) => {
    const { id } = req.params
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" });
        }

        const typepanne = await prisma.typepanne.findFirst({
            where: { id: parseInt(id) }
        });

        if (!typepanne) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        res.status(200).json(typepanne)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// create new typepanne
const createTypepanne = async (req, res) => {
    const { name } = req.body

    let emptyFields = [];

    if (!name) emptyFields.push('name')

    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Veuillez remplir tout les champs!', emptyFields })
    }

    try {
        const exists = await prisma.typepanne.findFirst({
            where: { name: name }
        });

        if (exists) {
            return res.status(400).json({ error: 'Typepanne déjà utilisé' })
        }

        const typepanne = await prisma.typepanne.create({
            data: { name }
        })
        res.status(201).json(typepanne)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// delete a typepanne
const deleteTypepanne = async (req, res) => {
    const { id } = req.params
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const typepanne = await prisma.typepanne.findFirst({
            where: { id: parseInt(id) }
        });

        if (!typepanne) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        // check if typepanne has pannes
        const panne = await prisma.panne.findFirst({
            where: { typepanneId: parseInt(id) }
        });
        if (panne) {
            return res.status(405).json({ error: "Impossible de supprimer cet élément car il est référencé ailleurs." })
        }

        await prisma.typepanne.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json(typepanne)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// update a typepanne
const updateTypepanne = async (req, res) => {
    const { id } = req.params
    const { name } = req.body

    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const typepanne = await prisma.typepanne.findFirst({
            where: { id: parseInt(id) }
        });

        // check if name not already exist
        const nameExist = await prisma.typepanne.findFirst({
            where: { name: name, id: { not: parseInt(id) } },

        });
        if (nameExist) {
            return res.status(400).json({ error: "Nom déjà utilisé!" })
        }

        if (!typepanne) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        const updatedWorkout = await prisma.typepanne.update({
            where: { id: parseInt(id) },
            data: { name }
        });

        res.status(200).json(updatedWorkout)

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const addParcToTypepanne = async (req, res) => {
    const { parc_id, typepanne_id } = req.body;
    let emptyFields = [];

    if (!parc_id) emptyFields.push('Parc Id');
    if (!typepanne_id) emptyFields.push('Typepanne Id');

    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Veuillez remplir tout les champs!', emptyFields });
    }

    try {
        // Check if the relationship already exists
        const existingRelation = await prisma.typepanneParc.findUnique({
            where: {
                parcId_typepanneId: {
                    parcId: parseInt(parc_id),
                    typepanneId: parseInt(typepanne_id)
                }
            }
        });

        if (existingRelation) {
            return res.status(409).json({
                error: "Ce Type panne est déjà affcté à ce parc."
            });
        }

        // Create new relationship - CORRECTED VERSION
        const updated = await prisma.typepanneParc.create({
            data: {
                parc: { connect: { id: parseInt(parc_id) } },
                typepanne: { connect: { id: parseInt(typepanne_id) } }
            },
            include: {
                parc: true,
                typepanne: true
            }
        });

        res.status(201).json(updated);
    } catch (error) {
        // Improved error handling
        if (error.code === 'P2025') {
            return res.status(404).json({
                error: "Parc ou Typepanne introuvable. Vérifiez les IDs."
            });
        }
        res.status(400).json({ error: error.message });
    }
};

const deleteAffectationTypepanne = async (req, res) => {
    const { parc_id, typepanne_id } = req.body;
    let emptyFields = [];

    if (!parc_id) emptyFields.push('Parc Id');
    if (!typepanne_id) emptyFields.push('Typepanne Id');

    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Veuillez remplir tout les champs!', emptyFields });
    }

    try {
        // Check if record exists (using composite key format)
        const typepanne_parc = await prisma.typepanneParc.findUnique({
            where: {
                parcId_typepanneId: {
                    parcId: parseInt(parc_id),
                    typepanneId: parseInt(typepanne_id)
                }
            }
        });

        if (!typepanne_parc) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" });
        }

        // Delete using composite key format
        await prisma.typepanneParc.delete({
            where: {
                parcId_typepanneId: {
                    parcId: parseInt(parc_id),
                    typepanneId: parseInt(typepanne_id)
                }
            }
        });

        res.status(200).json(typepanne_parc);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllTypepannesByParcId = async (req, res) => {
    try {
        const { id } = req.params;

        const typepannes = await prisma.typepanne.findMany({
            where: {
                TypepanneParc: {
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

        res.status(200).json(typepannes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


module.exports = {
    createTypepanne,
    getTypepannes,
    getTypepanne,
    deleteTypepanne,
    updateTypepanne,

    addParcToTypepanne,
    deleteAffectationTypepanne,
    getAllTypepannesByParcId
}