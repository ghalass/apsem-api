// prismaClient.js
const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
    // En production, nous évitons de recréer l'instance pour chaque requête
    prisma = new PrismaClient();
} else {
    // En mode développement, on utilise une instance globale pour éviter de multiples connexions
    // lorsqu'on recharge l'application (par exemple avec nodemon)
    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}

module.exports = prisma;
