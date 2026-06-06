// Test compilation of the entire Express app tree
try {
  console.log('--- STARTING APP COMPILATION CHECK ---');
  // Inject mock PG before requiring app
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function(path) {
    if (path === 'pg') return require('../config/__mocks__/pg');
    return originalRequire.apply(this, arguments);
  };

  const app = require('../app');
  console.log('[OK] All routes, controllers, services, and middlewares compiled successfully.');
  console.log('--- BACKEND VERIFICATION COMPLETE ---');
  process.exit(0);
} catch (e) {
  console.error('--- APP COMPILATION FAILED ---');
  console.error(e);
  process.exit(1);
}