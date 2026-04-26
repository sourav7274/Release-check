const { PrismaClient } = require('@prisma/client');
const { getDefaultStepState } = require('../src/utils/computeStatus');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  const releases = [
    {
      name: 'Version 1.0.1',
      releaseDate: new Date('2022-09-20'),
      additionalInfo: 'Initial stable release',
      stepState: {
        github_prs_merged: true,
        changelog_updated: true,
        all_tests_passing: true,
        release_created: true,
        deployed_in_demo: true,
        tested_in_demo: true,
        deployed_in_production: true,
      },
    },
    {
      name: 'Version 1.0.2',
      releaseDate: new Date('2022-09-28'),
      additionalInfo: 'Bug fix release',
      stepState: {
        github_prs_merged: true,
        changelog_updated: true,
        all_tests_passing: true,
        release_created: true,
        deployed_in_demo: true,
        tested_in_demo: true,
        deployed_in_production: true,
      },
    },
    {
      name: 'Version 1.1.0',
      releaseDate: new Date('2022-10-10'),
      additionalInfo: 'Feature release with new dashboard',
      stepState: {
        github_prs_merged: true,
        changelog_updated: true,
        all_tests_passing: true,
        release_created: false,
        deployed_in_demo: false,
        tested_in_demo: false,
        deployed_in_production: false,
      },
    },
    {
      name: 'Version 2 (beta)',
      releaseDate: new Date('2022-11-01'),
      additionalInfo: 'Major version beta',
      stepState: getDefaultStepState(),
    },
  ];

  for (const data of releases) {
    await prisma.release.create({ data });
  }

  console.log(`✅ Seeded ${releases.length} releases`);
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
