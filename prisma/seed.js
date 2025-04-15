const { PrismaClient, UserRoleType } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
  const typeParc = await prisma.typeparc.create({
    data: { name: faker.commerce.department() },
  });

  const typePanne = await prisma.typepanne.create({
    data: { name: faker.vehicle.bicycle() },
  });

  const typeLubrifiant = await prisma.typelubrifiant.create({
    data: { name: faker.commerce.productMaterial() },
  });

  const typeConsLub = await prisma.typeconsommationlub.create({
    data: { name: faker.commerce.product() },
  });

  const lubrifiant = await prisma.lubrifiant.create({
    data: {
      name: faker.commerce.product(),
      typelubrifiantId: typeLubrifiant.id,
    },
  });

  const site = await prisma.site.create({
    data: { name: faker.company.name() },
  });

  const parc = await prisma.parc.create({
    data: {
      name: faker.vehicle.vehicle(),
      typeparcId: typeParc.id,
    },
  });

  await prisma.typepanneParc.create({
    data: {
      parcId: parc.id,
      typepanneId: typePanne.id,
    },
  });

  await prisma.lubrifiantParc.create({
    data: {
      parcId: parc.id,
      lubrifiantId: lubrifiant.id,
    },
  });

  await prisma.typeconsommationlubParc.create({
    data: {
      parcId: parc.id,
      typeconsommationlubId: typeConsLub.id,
    },
  });

  await prisma.objectif.create({
    data: {
      annee: new Date().getFullYear(),
      parcId: parc.id,
      siteId: site.id,
      dispo: faker.number.float({ min: 70, max: 100 }),
      mtbf: faker.number.float({ min: 0, max: 100 }),
      tdm: faker.number.float({ min: 0, max: 100 }),
      spe_huile: faker.number.float({ min: 0, max: 10 }),
      spe_go: faker.number.float({ min: 0, max: 10 }),
      spe_graisse: faker.number.float({ min: 0, max: 10 }),
    },
  });

  const engin = await prisma.engin.create({
    data: {
      name: faker.vehicle.vehicle(),
      active: true,
      parcId: parc.id,
      siteId: site.id,
      initialHeureChassis: faker.number.float({ min: 0, max: 1000 }),
    },
  });

  const saisiehrm = await prisma.saisiehrm.create({
    data: {
      du: faker.date.recent(),
      enginId: engin.id,
      siteId: site.id,
      hrm: faker.number.float({ min: 1, max: 24 }),
    },
  });

  const panne = await prisma.panne.create({
    data: {
      name: faker.word.words(1),
      typepanneId: typePanne.id,
    },
  });

  const saisiehim = await prisma.saisiehim.create({
    data: {
      panneId: panne.id,
      him: faker.number.float({ min: 0, max: 10 }),
      ni: faker.number.int({ min: 0, max: 5 }),
      saisiehrmId: saisiehrm.id,
      enginId: engin.id,
      obs: faker.lorem.sentence(),
    },
  });

  await prisma.saisielubrifiant.create({
    data: {
      lubrifiantId: lubrifiant.id,
      qte: faker.number.float({ min: 1, max: 20 }),
      obs: faker.lorem.words(5),
      saisiehimId: saisiehim.id,
      typeconsommationlubId: typeConsLub.id,
    },
  });

  for (let i = 0; i < 5; i++) {
    await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: UserRoleType.USER,
        active: true,
        lastVisite: faker.date.recent(),
      },
    });
  }

  console.log('✅ Fake data inserted!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
