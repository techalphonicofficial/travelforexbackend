class BookingEmailScheduler {
  constructor(bookingEmailService, options = {}) {
    this.bookingEmailService = bookingEmailService;
    this.intervalMs = options.intervalMs || Number(process.env.BOOKING_EMAIL_INTERVAL_MS || 60000);
    this.batchSize = options.batchSize || Number(process.env.BOOKING_EMAIL_BATCH_SIZE || 10);
    this.timer = null;
    this.running = false;
  }

  start() {
    if (this.timer || !this.bookingEmailService) return;
    this.timer = setInterval(() => {
      this.tick().catch(error => {
        console.error('Booking email scheduler error:', error.message);
      });
    }, this.intervalMs);
    if (this.timer.unref) this.timer.unref();
    this.tick().catch(error => {
      console.error('Booking email scheduler startup error:', error.message);
    });
  }

  stop() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  async tick() {
    if (this.running) return;
    this.running = true;
    try {
      await this.bookingEmailService.sendQueuedPending(this.batchSize);
    } finally {
      this.running = false;
    }
  }
}

module.exports = BookingEmailScheduler;
