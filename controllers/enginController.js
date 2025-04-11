const prisma = require('../prismaClient')

// get all
const getEngins = async (req, res) => {
    try {
        const engins = await prisma.engin.findMany({
            include: { Parc: { include: { Typeparc: true } }, Site: true },
            orderBy: { name: 'asc' },
        });

        if (!engins.length) {
            return res.status(404).json({ message: "No engins found" });
        }

        res.status(200).json(engins);
    } catch (error) {
        console.error("Error fetching engins:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// get a single engin
const getEngin = async (req, res) => {
    const { id } = req.params
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" });
        }

        const engin = await prisma.engin.findFirst({
            include: { Parc: true, Site: true },
            where: { id: parseInt(id) }
        });

        if (!engin) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        res.status(200).json(engin)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// get a single engin by parcId
const getEnginByParcId = async (req, res) => {
    const { id } = req.params
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" });
        }

        const engin = await prisma.engin.findMany({
            where: { parcId: parseInt(id) }
        });

        if (!engin) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        res.status(200).json(engin)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getEnginsByParcIdSiteId = async (req, res) => {
    try {
        const { parcId, siteId } = req.params
        // return res.status(200).json(siteId)
        let emptyFields = [];

        if (!parcId) emptyFields.push('parcId')
        if (!siteId) emptyFields.push('siteId')

        if (emptyFields.length > 0) {
            return res.status(400).json({ error: 'Veuillez remplir tout les champs!', emptyFields })
        }

        if (isNaN(parcId) || parseInt(parcId) != parcId) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" });
        }

        if (isNaN(siteId) || parseInt(siteId) != siteId) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" });
        }

        const engin = await prisma.engin.findMany({
            where: { parcId: parseInt(parcId), siteId: parseInt(siteId) }
        });

        // if (!engin) {
        //     return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        // }

        res.status(200).json(engin)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// create new engin
const createEngin = async (req, res) => {
    try {
        const { name, parcId, siteId, initialHeureChassis, active } = req.body

        let emptyFields = [];

        if (!name) emptyFields.push('name')
        if (!parcId) emptyFields.push('parcId')
        if (!siteId) emptyFields.push('siteId')

        if (emptyFields.length > 0) {
            return res.status(400).json({ error: 'Veuillez remplir tout les champs!', emptyFields })
        }

        const exists = await prisma.engin.findFirst({
            where: { name }
        });

        if (exists) {
            return res.status(400).json({ error: 'Engin déjà utilisé' })
        }

        const engin = await prisma.engin.create({
            data: { name, parcId: parseInt(parcId), siteId: parseInt(siteId), initialHeureChassis: parseFloat(initialHeureChassis), active }
        })
        res.status(201).json(engin)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// delete a engin
const deleteEngin = async (req, res) => {
    const { id } = req.params
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const engin = await prisma.engin.findFirst({
            where: { id: parseInt(id) }
        });
        if (!engin) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        await prisma.engin.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json(engin)
    } catch (error) {
        console.warn(error);

        res.status(500).json({ error: error.message });
    }
}

// update a engin
const updateEngin = async (req, res) => {
    try {
        const { id } = req.params
        const { name, parcId, siteId, initialHeureChassis, active } = req.body

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        // check if name not already exist
        const nameExist = await prisma.engin.findFirst({
            where: { name, id: { not: parseInt(id) } },

        });
        if (nameExist) {
            return res.status(400).json({ error: "Nom déjà utilisé!" })
        }

        const engin = await prisma.engin.findFirst({
            where: { id: parseInt(id) }
        });
        if (!engin) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        const updatedWorkout = await prisma.engin.update({
            where: { id: parseInt(id) },
            data: { name, parcId: parseInt(parcId), siteId: parseInt(siteId), initialHeureChassis: parseFloat(initialHeureChassis), active }
        });

        res.status(200).json(updatedWorkout)

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    createEngin,
    getEngins,
    getEngin,
    deleteEngin,
    updateEngin,
    getEnginByParcId,
    getEnginsByParcIdSiteId,
}