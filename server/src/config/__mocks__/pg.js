// Mock pg module to allow compilation testing without a live DB in sandbox
module.exports = {
  Pool: class {
    connect() { return { query: async () => ({ rows: [] }), release: () => {} }; }
    query() { return { rows: [] }; }
    on() {}
  }
};