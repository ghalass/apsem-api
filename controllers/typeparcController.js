const prisma = require('../prismaClient')

// get all
const getTypeparcs = async (req, res) => {
    try {
        const typeparcs = await prisma.typeparc
            .findMany({
                orderBy: { name: 'asc' },
            });
        res.status(200).json(typeparcs)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// get a single typeparc
const getTypeparc = async (req, res) => {
    const { id } = req.params
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" });
        }

        const typeparc = await prisma.typeparc.findFirst({
            where: { id: parseInt(id) }
        });

        if (!typeparc) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        res.status(200).json(typeparc)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// create new typeparc
const createTypeparc = async (req, res) => {
    const { name } = req.body

    let emptyFields = [];

    if (!name) emptyFields.push('name')

    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Veuillez remplir tout les champs!', emptyFields })
    }

    try {
        const exists = await prisma.typeparc.findFirst({
            where: { name: name }
        });

        if (exists) {
            return res.status(400).json({ error: 'Typeparc déjà utilisé' })
        }

        const typeparc = await prisma.typeparc.create({
            data: { name }
        })
        res.status(201).json(typeparc)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// delete a typeparc
const deleteTypeparc = async (req, res) => {
    const { id } = req.params
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const typeparc = await prisma.typeparc.findFirst({
            where: { id: parseInt(id) }
        });

        if (!typeparc) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        // check if typeparc has parcs
        const parc = await prisma.parc.findFirst({
            where: { typeparcId: parseInt(id) }
        });
        if (parc) {
            return res.status(405).json({ error: "Impossible de supprimer cet élément car il est référencé ailleurs." })
        }

        await prisma.typeparc.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json(typeparc)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// update a typeparc
const updateTypeparc = async (req, res) => {
    try {
        const { id } = req.params
        const { name } = req.body
        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const typeparc = await prisma.typeparc.findFirst({
            where: { id: parseInt(id) }
        });

        // check if name not already exist
        const nameExist = await prisma.typeparc.findFirst({
            where: { name: name, id: { not: parseInt(id) } },

        });
        if (nameExist) {
            return res.status(400).json({ error: "Nom déjà utilisé!" })
        }

        if (!typeparc) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        const updatedWorkout = await prisma.typeparc.update({
            where: { id: parseInt(id) },
            data: { name }
        });

        res.status(200).json(updatedWorkout)

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    createTypeparc,
    getTypeparcs,
    getTypeparc,
    deleteTypeparc,
    updateTypeparc
}