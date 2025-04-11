const prisma = require('../prismaClient')

// get all
const getTypelubrifiant = async (req, res) => {
    try {
        const typepannes = await prisma.typelubrifiant
            .findMany({
                orderBy: { name: 'asc' },
            });
        res.status(200).json(typepannes)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// get a single typepanne
// const getTypepanne = async (req, res) => {
//     const { id } = req.params
//     try {

//         if (isNaN(id) || parseInt(id) != id) {
//             return res.status(404).json({ error: "Enregistrement n'existe pas!" });
//         }

//         const typepanne = await prisma.typepanne.findFirst({
//             where: { id: parseInt(id) }
//         });

//         if (!typepanne) {
//             return res.status(404).json({ error: "Enregistrement n'existe pas!" })
//         }

//         res.status(200).json(typepanne)
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }

// create new typepanne
const createTypelubrifiant = async (req, res) => {
    try {
        const { name } = req.body

        let emptyFields = [];

        if (!name) emptyFields.push('name')

        if (emptyFields.length > 0) {
            return res.status(400).json({ error: 'Veuillez remplir tout les champs!', emptyFields })
        }
        const exists = await prisma.typelubrifiant.findFirst({
            where: { name: name }
        });

        if (exists) {
            return res.status(400).json({ error: 'Typelubrifiant déjà utilisé' })
        }

        const created = await prisma.typelubrifiant.create({
            data: { name }
        })
        res.status(201).json(created)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// delete a typepanne
const deleteTypelubrifiant = async (req, res) => {
    try {
        const { id } = req.params

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const typelubrifiant = await prisma.typelubrifiant.findFirst({
            where: { id: parseInt(id) }
        });

        if (!typelubrifiant) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        // check if typelubrifiant has pannes
        const lubrifiant = await prisma.lubrifiant.findFirst({
            where: { typelubrifiantId: parseInt(id) }
        });
        if (lubrifiant) {
            return res.status(405).json({ error: "Impossible de supprimer cet élément car il est référencé ailleurs." })
        }

        await prisma.typelubrifiant.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json(typelubrifiant)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// update a typepanne
const updateTypelubrifiant = async (req, res) => {
    try {
        const { id } = req.params
        const { name } = req.body

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const typelubrifiant = await prisma.typelubrifiant.findFirst({
            where: { id: parseInt(id) }
        });

        // check if name not already exist
        const nameExist = await prisma.typelubrifiant.findFirst({
            where: { name: name, id: { not: parseInt(id) } },

        });
        if (nameExist) {
            return res.status(400).json({ error: "Nom déjà utilisé!" })
        }

        if (!typelubrifiant) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        const created = await prisma.typelubrifiant.update({
            where: { id: parseInt(id) },
            data: { name }
        });

        res.status(200).json(created)

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    createTypelubrifiant,
    getTypelubrifiant,
    // getTypepanne,
    deleteTypelubrifiant,
    updateTypelubrifiant
}