const prisma = require('../prismaClient')

// get all
const getPannes = async (req, res) => {
    try {
        const pannes = await prisma.panne
            .findMany({
                include: { Typepanne: true },
                orderBy: { name: 'asc' },
            });
        res.status(200).json(pannes)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// get a single panne
const getPanne = async (req, res) => {
    const { id } = req.params
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" });
        }

        const panne = await prisma.panne.findFirst({
            include: { Typepanne: true },
            where: { id: parseInt(id) }
        });

        if (!panne) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        res.status(200).json(panne)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// create new panne
const createPanne = async (req, res) => {
    // return res.status(201).json(req.body)
    try {
        const { name, typepanneId } = req.body

        let emptyFields = [];

        if (!name) emptyFields.push('name')
        if (!typepanneId) emptyFields.push('typepanneId')

        if (emptyFields.length > 0) {
            return res.status(400).json({ error: 'Veuillez remplir tout les champs!', emptyFields })
        }

        const exists = await prisma.panne.findFirst({
            where: { name }
        });

        if (exists) {
            return res.status(400).json({ error: 'Panne déjà utilisé' })
        }

        const panne = await prisma.panne.create({
            data: { name, typepanneId: parseInt(typepanneId) }
        })
        res.status(201).json(panne)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// delete a panne
const deletePanne = async (req, res) => {
    const { id } = req.params
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const panne = await prisma.panne.findFirst({
            where: { id: parseInt(id) }
        });
        if (!panne) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        await prisma.panne.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json(panne)
    } catch (error) {
        console.warn(error);

        res.status(500).json({ error: error.message });
    }
}

// update a panne
const updatePanne = async (req, res) => {
    const { id } = req.params
    const { name, typepanneId } = req.body

    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const panne = await prisma.panne.findFirst({
            where: { id: parseInt(id) }
        });

        // check if name not already exist
        const nameExist = await prisma.panne.findFirst({
            where: { name, id: { not: parseInt(id) } },

        });
        if (nameExist) {
            return res.status(401).json({ error: "Nom déjà utilisé!" })
        }

        if (!panne) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        const updatedWorkout = await prisma.panne.update({
            where: { id: parseInt(id) },
            data: { name, typepanneId: parseInt(typepanneId) }
        });

        res.status(200).json(updatedWorkout)

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const fetchPannesByTypepanne = async (req, res) => {
    const { id } = req.params
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" });
        }

        const panne = await prisma.panne.findMany({
            include: { Typepanne: true },
            where: { typepanneId: parseInt(id) }
        });

        if (!panne) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        res.status(200).json(panne)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createPanne,
    getPannes,
    getPanne,
    deletePanne,
    updatePanne,
    fetchPannesByTypepanne,
}