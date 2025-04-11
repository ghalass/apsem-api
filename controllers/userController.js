require('dotenv').config()
const prisma = require('../prismaClient')
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')

const tokenExpireIn = 7; //hour

const generateToken = (loggedUser) => {
    return jwt.sign(loggedUser, process.env.ACCESS_TOKEN_SECRET, { expiresIn: `${tokenExpireIn}h` });
};

// signup user
const signupUser = async (req, res) => {
    const { name, email, password } = req.body

    try {
        // validation 
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Veuillez remplir tout les champs!" });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: "E-mail invalide!" });
        }
        if (!validator.isLength(password, { min: 6 })) {
            return res.status(400).json({ error: "Password doit être au minimum de 4 caractères!" });
        }

        const exists = await prisma.user.findFirst({
            where: { email: email }
        });

        if (exists) {
            return res.status(400).json({ error: "E-mail déjà utilisé." })
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt)

        const user = await prisma.user.create({
            data: { name, email, password: hash, lastVisite: new Date().toISOString() }
        });

        // SELECT USER FIELDS TO SAVE IN TOKEN
        const createdUser = {
            id: user?.id,
            name: user?.name,
            email: user?.email,
            role: user?.role,
        }
        // GENERATE TOKEN
        const token = generateToken(createdUser)

        // SEND USER AND TOKEN
        res.status(200).json({ user: createdUser, token })
    } catch (error) {
        console.log(error);

        res.status(400).json({ error: error.message });
    }
}

// login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        // FIELDS VALIDATION 
        if (!email || !password) { return res.status(400).json({ error: "Veuillez remplir tout les champs!" }); }
        if (!validator.isEmail(email)) { return res.status(400).json({ error: "E-mail invalide!" }); }

        // FIND THE USER
        const user = await prisma.user.findFirst({ where: { email: email } });

        // CHECK IF USER EXIST
        if (!user) { return res.status(400).json({ error: "E-mail Or Password incorrect." }) }

        // CHECK PASSWORD
        const match = await bcrypt.compare(password, user.password)
        if (!match) { return res.status(400).json({ error: "E-mail Or Password incorrect." }) }

        // CHECK IF ACCOUNT IS ACTIVE
        if (!user?.active) return res.status(400).json({ error: "Votre compte est désactivé, veuillez contacter un admin." })

        // SELECT USER FIELDS TO SAVE IN TOKEN
        const loggedUser = {
            id: user?.id,
            name: user?.name,
            email: user?.email,
            role: user?.role,
        }
        // GENERATE TOKEN
        const token = generateToken(loggedUser)
        res.cookie('jwt', token, {
            httpOnly: true, //accessible only by web server
            secure: true, //https
            sameSite: 'None', //cross-site cookie
            maxAge: tokenExpireIn * 60 * 60 * 1000, // tokenExpireIn * 60 * 60 * 1000 ==> hours
        });

        await setLastViste(email)

        // SEND USER AND TOKEN
        res.status(200).json({ user: loggedUser, token })
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// login user
const logoutUser = async (req, res) => {
    try {
        const cookies = req.cookies;
        res.clearCookie('jwt')
        res.status(200).json(cookies)
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// 
const setLastViste = async (email) => {

    try {
        await prisma.user.update({
            where: { email: email },
            data: { lastVisite: new Date().toISOString() },
            omit: { password: true }
        });
    } catch (error) {
        return error.message
    }
}

// login user
const getByEmail = async (req, res) => {
    const { email } = req.body

    try {

        const user = await prisma.user.findFirst({
            where: { email: email },
            omit: { password: true },
        });

        if (!user) {
            return res.status(400).json({ error: "Utilisateur non trouvé!." })
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// signup user
const changePassword = async (req, res) => {
    const { oldPassword, newPassword, email } = req.body

    try {
        // validation inputs
        if (!oldPassword || !newPassword || !email) {
            return res.status(400).json({ error: "Veuillez remplir tout les champs!" });
        }
        if (!validator.isLength(newPassword, { min: 6 })) {
            return res.status(400).json({ error: "Password doit être au minimum de 6 caractères!" });
        }
        // find the user
        const exists = await prisma.user.findFirst({
            where: { email: email }
        });

        // check is user email exist
        if (!exists) {
            return res.status(400).json({ error: "E-mail n'existe pas!" })
        }

        // check if actual password is correct
        const match = await bcrypt.compare(oldPassword, exists.password)
        if (!match) {
            return res.status(400).json({ error: "Password actuel est incorrect." })
        }

        // check if email is his email
        // user can change only his password
        // verify authentication
        const { authorization } = req.headers
        if (!authorization) {
            return res.status(401).json({ error: 'Authorization token required!' })
        }
        const token = authorization.split(' ')[1]
        const { id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        if (exists.id !== id) {
            return res.status(400).json({ error: "Vous pouvez changer uniquement votre propre mot de passe!" })
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt)

        const updatedUser = await prisma.user.update({
            where: { email: email },
            data: { password: hash },
            omit: { password: true }
        });

        res.status(200).json(updatedUser)
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// get all users
const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: [
                { role: 'asc' },
                { name: 'asc' },
                { active: 'desc' },
            ],
            omit: { password: true }
        });
        return res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// update a user
const updateUser = async (req, res) => {
    try {
        const { id } = req.body

        // CHECK IF USER ID IS PROVIDED
        if (!req?.body?.id) return res.status(404).json({ error: "YOU MUST PROVID THE USER ID" })

        // FIND & CHECK IF USER TO UPDATE IS EXIST  
        const selectedUSER = await prisma.user.findFirst({ where: { id: id } });
        if (!selectedUSER) return res.status(404).json({ error: "USER NOT FOUND" })

        // CHECK IF EMAIL IS NOT ALREADY USED BY AN OTHER USER
        if (req?.body?.email && await prisma.user.findFirst({ where: { email: req?.body?.email, id: { not: parseInt(id) } } }))
            return res.status(401).json({ error: "CET EMAIL D'UTILISATEUR EST DÉJÀ UTILISÉ!" })

        delete req.body?.id; // remove id from req.body

        if (req.body.password !== "") {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(req.body.password, salt)
            req.body.password = hash
        } else {
            delete req.body.password
        }

        // UPDATE THE USER
        const updatedUser = await prisma.user.update({ where: { id: parseInt(id) }, data: req.body });

        // REMOVE PASSWORD BEFORE SEND USER
        const { password, ...updatedUserWithOutPassword } = updatedUser;

        res.status(200).json(updatedUserWithOutPassword)

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const refresh = async (req, res) => {
    const cookies = req.cookies;
    // return res.json({ cookies })
    // check if token exist
    if (!cookies?.Bearer) return res.status(401).json({ message: "Unauthorized" });
    const refreshToken = cookies.refreshToken;
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) return res.status(403).json({ message: "Forbidden" });
            // check if user exist
            const foundedUser = await prisma.user.findFirst({
                where: { id: decoded?.id }
            });
            if (!foundedUser) res.status(401).json({ message: "Unauthorized" });

            const accessToken = jwt.sign({
                id: foundedUser.id,
                name: foundedUser.name,
                email: foundedUser.email
            },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );

            res.status(200).json({ email: foundedUser.email, name: foundedUser.name, token: accessToken })

        })
}

const checkToken = async (req, res, next) => {
    const cookies = req.cookies;

    // FETCH TOKEN FROM COOKIE
    const jwtCookie = cookies?.jwt

    // CHECK IF TOKEN EXIST
    if (!jwtCookie) return res.status(401).json({ error: "UNAUTHORIZED" });

    // VERIFY TOKEN
    jwt.verify(
        jwtCookie,
        process.env.ACCESS_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) return res.status(403).json({ error: "FORBIDDEN" });

            // CHECK IF USER EXIST IN DATABASE
            const foundedUser = await prisma.user.findFirst({ where: { id: decoded?.id } });
            if (!foundedUser) res.status(401).json({ error: "UNAUTHORIZED" });

            // SELECT USER FIELDS TO SAVE IN TOKEN
            const loggedUser = {
                id: foundedUser?.id,
                name: foundedUser?.name,
                email: foundedUser?.email,
                role: foundedUser?.role,
            }

            // SEND USER AND TOKEN
            res.status(200).json({ user: loggedUser, jwt: jwtCookie })
        }
    )
}

// delete a user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params
        console.log(id);

        if (isNaN(id) || parseInt(id) != id) {
            return res.status(404).json({ error: "Enregistrement n'est pas trouvé!" });
        }

        const user = await prisma.user.findFirst({
            where: { id: parseInt(id) }
        });

        if (!user) {
            return res.status(404).json({ error: "Enregistrement n'existe pas!" })
        }

        await prisma.user.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// login user
const createSuperAdmin = async (req, res, next) => {
    try {
        const name = 'ghalass'
        const email = 'ghalass@gmail.com'
        const password = 'gh@l@ss@dmin'
        const role = 'SUPER_ADMIN'
        const active = true

        // CHECK IF USER EXIST IN DATABASE
        const exists = await prisma.user.findFirst({ where: { email: email } });
        // IF EXIST RETURN
        if (exists) return res.status(400).json("SUPER_ADMIN ALREADY CREATED")
        // IF NOT EXIST RETURN => CREATE HIM
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt)

        const user = await prisma.user.create({
            data: { name, email, password: hash, role, active, lastVisite: new Date().toISOString() }
        });

        // CONFIRMATION
        return res.status(200).json("SUPER_ADMIN CREATED SUCCESSFULLY")
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    loginUser,
    signupUser,
    getByEmail,
    changePassword,
    getUsers,
    updateUser,
    refresh,
    deleteUser,
    logoutUser,
    checkToken,
    createSuperAdmin,
}