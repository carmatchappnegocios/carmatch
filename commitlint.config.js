module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting (no code change)
        'refactor', // Code refactoring
        'perf',     // Performance improvement
        'test',     // Adding tests
        'build',    // Build system or dependencies
        'ci',       // CI configuration
        'chore',    // Other changes
        'revert',   // Revert a commit
      ],
    ],
    'scope-enum': [
      1,
      'always',
      [
        'auth',     // Authentication
        'api',      // API routes
        'ui',       // UI components
        'map',      // Map/MapBox
        'ai',       // AI features
        'db',       // Database/Prisma
        'config',   // Configuration
        'ci',       // CI/CD
        'deps',     // Dependencies
        'i18n',     // Internationalization
        'pwa',      // PWA/Install
        'seo',      // SEO/Metadata
      ],
    ],
    'subject-case': [0],
    'body-max-line-length': [0],
  },
}
