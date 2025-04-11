const prisma = require('../prismaClient')

// get all
const getSites = async (req, res) => {
    try {
        const sites = await prisma.site
            .findMany({
                orderBy: { name: 'asc' },
            });
        res.status(200).json(sites)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// get a single site
const getSite = async (req, res) => {
    const { id } = req.params
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" });
        }

        const site = await prisma.site.findFirst({
            where: { id: parseInt(id) }
        });

        if (!site) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        res.status(200).json(site)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// create new site
const createSite = async (req, res) => {
    const { name } = req.body

    let emptyFields = [];

    if (!name) emptyFields.push('name')

    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Veuillez remplir tout les champs!', emptyFields })
    }

    try {
        const exists = await prisma.site.findFirst({
            where: { name: name }
        });

        if (exists) {
            return res.status(400).json({ error: 'Site déjà utilisé' })
        }

        const site = await prisma.site.create({
            data: { name }
        })
        res.status(201).json(site)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// delete a site
const deleteSite = async (req, res) => {
    const { id } = req.params
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const site = await prisma.site.findFirst({
            where: { id: parseInt(id) }
        });

        if (!site) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        await prisma.site.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json(site)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// update a site
const updateSite = async (req, res) => {
    const { id } = req.params
    const { name } = req.body
    try {

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const site = await prisma.site.findFirst({
            where: { id: parseInt(id) }
        });

        // check if name not already exist
        const nameExist = await prisma.site.findFirst({
            where: { name: name, id: { not: parseInt(id) } },

        });
        if (nameExist) {
            return res.status(400).json({ error: "Nom déjà utilisé!" })
        }

        if (!site) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        const updatedWorkout = await prisma.site.update({
            where: { id: parseInt(id) },
            data: { name }
        });

        res.status(200).json(updatedWorkout)

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    createSite,
    getSites,
    getSite,
    deleteSite,
    updateSite
}