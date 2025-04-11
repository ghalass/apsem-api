const prisma = require('../prismaClient')

// get all
const getParcs = async (req, res) => {
    try {
        const parcs = await prisma.parc
            .findMany({
                include: { Typeparc: true },
                orderBy: { name: 'asc' },
            });
        res.status(200).json(parcs)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getParcsByTypeparc = async (req, res) => {
    try {
        const { id } = req.params
        const parcs = await prisma.parc.findMany({
            where: { typeparcId: parseInt(id) },
            include: { Typeparc: true },
            orderBy: { name: 'asc' },
        });
        res.status(200).json(parcs)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// get a single parc
const getParc = async (req, res) => {
    const { id } = req.params
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" });
        }

        const parc = await prisma.parc.findFirst({
            include: { Typeparc: true },
            where: { id: parseInt(id) }
        });

        if (!parc) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        res.status(200).json(parc)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// create new parc
const createParc = async (req, res) => {
    // return res.status(201).json(req.body)
    try {
        const { name, typeparcId } = req.body

        let emptyFields = [];

        if (!name) emptyFields.push('name')
        if (!typeparcId) emptyFields.push('typeparcId')

        if (emptyFields.length > 0) {
            return res.status(400).json({ error: 'Veuillez remplir tout les champs!', emptyFields })
        }

        const exists = await prisma.parc.findFirst({
            where: { name }
        });

        if (exists) {
            return res.status(400).json({ error: 'Parc déjà utilisé' })
        }

        const parc = await prisma.parc.create({
            data: { name, typeparcId: parseInt(typeparcId) }
        })
        res.status(201).json(parc)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// delete a parc
const deleteParc = async (req, res) => {
    const { id } = req.params
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const parc = await prisma.parc.findFirst({
            where: { id: parseInt(id) }
        });
        if (!parc) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        await prisma.parc.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json(parc)
    } catch (error) {
        console.warn(error);

        res.status(500).json({ error: error.message });
    }
}

// update a parc
const updateParc = async (req, res) => {
    try {
        const { id } = req.params
        const { name, typeparcId } = req.body

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }
        if (isNaN(typeparcId) || parseInt(typeparcId) != typeparcId) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const parc = await prisma.parc.findFirst({
            where: { id: parseInt(id) }
        });

        // check if name not already exist
        const nameExist = await prisma.parc.findFirst({
            where: { name, id: { not: parseInt(id) } },

        });
        if (nameExist) {
            return res.status(401).json({ error: "Nom déjà utilisé!" })
        }

        if (!parc) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        const updatedWorkout = await prisma.parc.update({
            where: { id: parseInt(id) },
            data: { name, typeparcId: parseInt(typeparcId) }
        });

        res.status(200).json(updatedWorkout)

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    createParc,
    getParcs,
    getParc,
    deleteParc,
    updateParc,
    getParcsByTypeparc,
}