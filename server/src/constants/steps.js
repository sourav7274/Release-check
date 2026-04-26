const STEPS = [
  { key: 'github_prs_merged', label: 'All relevant GitHub pull requests have been merged' },
  { key: 'changelog_updated', label: 'CHANGELOG.md files have been updated' },
  { key: 'all_tests_passing', label: 'All tests are passing' },
  { key: 'release_created', label: 'Releases in GitHub created' },
  { key: 'deployed_in_demo', label: 'Deployed in demo' },
  { key: 'tested_in_demo', label: 'Tested thoroughly in demo' },
  { key: 'deployed_in_production', label: 'Deployed in production' },
];

module.exports = STEPS;
