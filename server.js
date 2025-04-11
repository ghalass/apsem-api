require('dotenv').config()

const express = require('express')

const path = require('path')

const cookieParser = require('cookie-parser')
const cors = require('cors');
const corsOptions = require('./config/corsOptions');

const prisma = require("./prismaClient");

const userRoutes = require('./routes/user')
const sitesRoutes = require('./routes/sites');
const typeparcsRoutes = require('./routes/typeparcs');
const parcsRoutes = require('./routes/parcs');
const enginsRoutes = require('./routes/engins');
const typepannesRoutes = require('./routes/typepannes');
const typelubrifiantsRoutes = require('./routes/typelubrifiants');
const typeconsommationlubsRoutes = require('./routes/typeconsommationlub');
const pannesRoutes = require('./routes/pannes');
const saisiehrmRoutes = require('./routes/saisiehrm');
const rapportsRoutes = require('./routes/rapports');
const lubrifiantsRoutes = require('./routes/lubrifiants');
const saisielubrifiantRoutes = require('./routes/saisielubrifiant');

// express app
const app = express()

const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors(corsOptions));
app.use(cookieParser())

// allow json data
app.use(express.json())

// import static files
app.use('/', express.static(path.join(__dirname, "public")))

app.use(async (req, res, next) => {
    console.log(req.method, req.path);
    next();
})

// routes
app.use('/', require('./routes/root'))
// app.use('/auth', require('./routes/authRoutes'))

app.use('/user', userRoutes)
app.use('/sites', sitesRoutes)
app.use('/typeparcs', typeparcsRoutes)
app.use('/parcs', parcsRoutes)
app.use('/engins', enginsRoutes)
app.use('/typepannes', typepannesRoutes)
app.use('/typelubrifiants', typelubrifiantsRoutes)
app.use('/typeconsommationlubs', typeconsommationlubsRoutes)
app.use('/pannes', pannesRoutes)
app.use('/saisiehrm', saisiehrmRoutes)
app.use('/rapports', rapportsRoutes)
app.use('/lubrifiants', lubrifiantsRoutes)
app.use('/saisielubrifiant', saisielubrifiantRoutes)

// 404 route
app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts("html")) {
        res.sendFile(path.join(__dirname, "./views/404.html"))
    } else if (req.accepts('json')) {
        res.json({ message: "404 Not Found" })
    } else {
        res.type('txt').send("404 Not Found")
    }
})

// PRISMA & RUN SERVER
prisma
    .$connect()
    .then(() => {
        // listen for requests
        app.listen(PORT, () => {
            console.log(`Connected to DB & listening on port ${PORT}`);
            console.log(`http://localhost:${PORT}/`);
        })
    })
    .catch((error) => {
        console.log(error);
    });

