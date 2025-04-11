const prisma = require('../prismaClient')

// get all
const getObjectifs = async (req, res) => {
    try {
        const objectifs = await prisma.objectif.findMany({
            include: { Parc: true, Site: true },
            orderBy: { annee: 'asc' },
        });
        res.status(200).json(objectifs)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// get a single objectif
const getObjectif = async (req, res) => {
    const { id } = req.params
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" });
        }

        const objectif = await prisma.objectif.findFirst({
            where: { id: parseInt(id) }
        });

        if (!objectif) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        res.status(200).json(objectif)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// create new objectif
const createObjectif = async (req, res) => {
    const { name } = req.body

    let emptyFields = [];

    if (!name) emptyFields.push('name')

    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Veuillez remplir tout les champs!', emptyFields })
    }

    try {
        const exists = await prisma.objectif.findFirst({
            where: { name: name }
        });

        if (exists) {
            return res.status(400).json({ error: 'objectif déjà utilisé' })
        }

        const objectif = await prisma.objectif.create({
            data: { name }
        })
        res.status(201).json(objectif)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// delete a objectif
const deleteObjectif = async (req, res) => {
    const { id } = req.params
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const objectif = await prisma.objectif.findFirst({
            where: { id: parseInt(id) }
        });

        if (!objectif) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        await prisma.objectif.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json(objectif)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// update a objectif
const updateObjectif = async (req, res) => {
    const { id } = req.params
    const { name } = req.body
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const objectif = await prisma.objectif.findFirst({
            where: { id: parseInt(id) }
        });

        // check if name not already exist
        const nameExist = await prisma.objectif.findFirst({
            where: { name: name, id: { not: parseInt(id) } },

        });
        if (nameExist) {
            return res.status(400).json({ error: "Nom déjà utilisé!" })
        }

        if (!objectif) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        const updatedWorkout = await prisma.objectif.update({
            where: { id: parseInt(id) },
            data: { name }
        });

        res.status(200).json(updatedWorkout)

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    createObjectif,
    getObjectifs,
    getObjectif,
    deleteObjectif,
    updateObjectif
}