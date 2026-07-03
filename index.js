const server = require('./src/server');
const { db, services: { bookingEmailScheduler } } = require('./src/container');
const port = process.env.PORT || 3000;

// ─── Guard against any unhandled errors to keep the server alive ───
process.on('uncaughtException', (err) => {
  // 'Request aborted' is expected when clients disconnect mid-upload (e.g. ngrok)
  if (err.message === 'Request aborted') return;
  console.error('[uncaughtException]', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
// ──────────────────────────────────────────────────────────────────

db.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    if (bookingEmailScheduler) {
      bookingEmailScheduler.start();
    }
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

