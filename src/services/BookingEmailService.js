const net = require('net');
const tls = require('tls');
const { Buffer } = require('buffer');

const clean = (value) => (typeof value === 'string' ? value.trim() : '');
const money = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
};
const escapeHtml = (value) => clean(String(value === undefined || value === null ? '' : value))
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');
const safeHeader = (value) => clean(value).replace(/[\r\n]+/g, ' ');
const extractEmailAddress = (value) => {
  const raw = clean(value);
  const match = raw.match(/<([^>]+)>/);
  return clean(match ? match[1] : raw);
};

class BookingEmailService {
  constructor(models = {}, options = {}) {
    this.models = models;
    this.appSettingRepo = options.appSettingRepo || null;
  }

  async resolveCustomerContact(booking) {
    const row = booking && booking.get ? booking.get({ plain: true }) : booking;
    const fallback = {
      name: clean(row.customer_name),
      email: clean(row.customer_email).toLowerCase(),
      phone: clean(row.customer_phone)
    };

    if (!row || !row.customer_id || !this.models.Customer) return fallback;

    const include = this.models.User
      ? [{ model: this.models.User, as: 'user', required: false, attributes: ['id', 'name', 'email', 'phone_number'] }]
      : [];
    const customer = await this.models.Customer.findByPk(row.customer_id, { include }).catch(() => null);
    if (!customer) return fallback;

    const plain = customer.get ? customer.get({ plain: true }) : customer;
    return {
      name: clean(plain.user && plain.user.name) || fallback.name,
      email: clean(plain.user && plain.user.email).toLowerCase() || fallback.email,
      phone: clean(plain.phone || (plain.user && plain.user.phone_number)) || fallback.phone
    };
  }

  buildItinerarySnapshot(booking) {
    const row = booking && booking.get ? booking.get({ plain: true }) : booking;
    const raw = row.raw_payload || {};
    const route = Array.isArray(raw.route) ? raw.route : [];
    const hotels = Array.isArray(raw.hotels) ? raw.hotels : [];
    const passengers = Array.isArray(row.passengers) ? row.passengers : [];
    const itinerary = Array.isArray(raw.itinerary)
      ? raw.itinerary
      : (Array.isArray(raw.days) ? raw.days : []);

    return {
      booking_id: row.id,
      booking_reference: row.booking_reference,
      package_id: row.package_id,
      package_name: row.package_name,
      package_slug: row.package_slug,
      duration: raw.duration || null,
      route,
      hotels,
      itinerary,
      passengers: passengers.map(passenger => ({
        full_name: passenger.full_name,
        age: passenger.age,
        gender: passenger.gender,
        nationality: passenger.nationality,
        is_lead: passenger.is_lead
      })),
      amounts: {
        package_base_amount: Number(row.package_base_amount || 0),
        tax_type: row.tax_type || null,
        tax_percent: Number(row.tax_percent || 0),
        tax_amount: Number(row.tax_amount || 0),
        package_total: Number(row.package_total || 0),
        paid_amount: Number(row.paid_amount || 0),
        remaining_amount: Number(row.remaining_amount || 0)
      },
      payment_status: row.payment_status,
      payment_verified_at: row.payment_verified_at || null
    };
  }

  buildItineraryEmail({ booking, contact }) {
    const row = booking && booking.get ? booking.get({ plain: true }) : booking;
    const snapshot = this.buildItinerarySnapshot(row);
    const subject = `Your Picktrail itinerary - ${row.booking_reference}`;
    const routeText = snapshot.route.length ? snapshot.route.join(' -> ') : 'Route will be shared shortly';
    const passengerLines = snapshot.passengers.length
      ? snapshot.passengers.map((p, index) => `${index + 1}. ${p.full_name}${p.is_lead ? ' (Lead)' : ''}`).join('\n')
      : 'Passenger details are attached to your booking.';
    const hotelLines = snapshot.hotels.length
      ? snapshot.hotels.map((hotel, index) => `${index + 1}. ${hotel.name || hotel.hotel_name || hotel.title || 'Selected hotel'}`).join('\n')
      : 'Hotel selections will be confirmed by our team.';
    const itineraryLines = snapshot.itinerary.length
      ? snapshot.itinerary.map((day, index) => {
        const title = day.title || day.name || day.day_title || `Day ${day.day || index + 1}`;
        const description = day.description || day.summary || day.details || '';
        return `${index + 1}. ${title}${description ? ` - ${description}` : ''}`;
      }).join('\n')
      : `${snapshot.duration || 'Trip'} package itinerary is being prepared by our team.`;

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.55;color:#222;max-width:680px;margin:0 auto;">
        <h2 style="margin:0 0 12px;">Booking confirmed</h2>
        <p>Hi ${escapeHtml(contact.name || row.customer_name || 'Traveller')},</p>
        <p>Your package booking is confirmed. Your booking id is <strong>${escapeHtml(row.booking_reference)}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:18px 0;">
          <tr><td style="padding:8px;border:1px solid #ddd;">Package</td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(row.package_name || 'Package')}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Duration</td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(snapshot.duration || 'To be confirmed')}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Route</td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(routeText)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Paid</td><td style="padding:8px;border:1px solid #ddd;">INR ${money(snapshot.amounts.paid_amount)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;">Remaining</td><td style="padding:8px;border:1px solid #ddd;">INR ${money(snapshot.amounts.remaining_amount)}</td></tr>
        </table>
        <h3>Travellers</h3>
        <pre style="white-space:pre-wrap;font-family:Arial,sans-serif;">${escapeHtml(passengerLines)}</pre>
        <h3>Hotels</h3>
        <pre style="white-space:pre-wrap;font-family:Arial,sans-serif;">${escapeHtml(hotelLines)}</pre>
        <h3>Itinerary</h3>
        <pre style="white-space:pre-wrap;font-family:Arial,sans-serif;">${escapeHtml(itineraryLines)}</pre>
        <p>Thanks,<br>Picktrail Team</p>
      </div>
    `;

    const text = [
      `Hi ${contact.name || row.customer_name || 'Traveller'},`,
      '',
      `Your package booking is confirmed. Booking id: ${row.booking_reference}`,
      `Package: ${row.package_name || 'Package'}`,
      `Duration: ${snapshot.duration || 'To be confirmed'}`,
      `Route: ${routeText}`,
      `Paid: INR ${money(snapshot.amounts.paid_amount)}`,
      `Remaining: INR ${money(snapshot.amounts.remaining_amount)}`,
      '',
      'Travellers:',
      passengerLines,
      '',
      'Hotels:',
      hotelLines,
      '',
      'Itinerary:',
      itineraryLines,
      '',
      'Thanks,',
      'Picktrail Team'
    ].join('\n');

    return { subject, html, text, payload: snapshot };
  }

  async enqueuePackageBookingItinerary(booking) {
    if (!this.models.BookingEmailQueue) return null;

    const row = booking && booking.get ? booking.get({ plain: true }) : booking;
    if (!row || !row.id) return null;

    const existing = await this.models.BookingEmailQueue.findOne({
      where: {
        booking_id: row.id,
        email_type: 'package_itinerary'
      }
    });
    if (existing) return existing;

    const contact = await this.resolveCustomerContact(row);
    if (!contact.email) return null;

    const email = this.buildItineraryEmail({ booking: row, contact });
    return this.models.BookingEmailQueue.create({
      booking_id: row.id,
      booking_reference: row.booking_reference,
      email_type: 'package_itinerary',
      recipient_email: contact.email,
      recipient_name: contact.name || row.customer_name || null,
      subject: email.subject,
      html_body: email.html,
      text_body: email.text,
      payload: email.payload,
      status: 'pending',
      scheduled_at: new Date()
    });
  }

  async setting(key) {
    if (!this.appSettingRepo || typeof this.appSettingRepo.get !== 'function') return '';
    return clean(await this.appSettingRepo.get(key));
  }

  async getSmtpConfig() {
    const configuredHost = await this.setting('booking_mail_host');
    const configuredPort = await this.setting('booking_mail_port');
    const configuredSecure = await this.setting('booking_mail_secure');
    const configuredEmail = await this.setting('booking_mail_from_email');
    const configuredUser = await this.setting('booking_mail_username');
    const configuredPass = await this.setting('booking_mail_app_password');
    const configuredName = await this.setting('booking_mail_from_name');
    const fallbackName = await this.setting('company_name');
    const fromAddress = configuredEmail || configuredUser || clean(process.env.SMTP_FROM || process.env.MAIL_FROM || process.env.SMTP_USER || process.env.MAIL_USER);
    const fromName = configuredName || fallbackName;
    const fromHeader = fromName ? `${safeHeader(fromName)} <${fromAddress}>` : fromAddress;

    return {
      host: configuredHost || clean(process.env.SMTP_HOST || process.env.MAIL_HOST),
      port: Number(configuredPort || process.env.SMTP_PORT || process.env.MAIL_PORT || 587),
      secure: String(configuredSecure || process.env.SMTP_SECURE || process.env.MAIL_SECURE || '').toLowerCase() === 'true',
      user: configuredUser || configuredEmail || clean(process.env.SMTP_USER || process.env.MAIL_USER),
      pass: configuredPass || clean(process.env.SMTP_PASS || process.env.MAIL_PASSWORD),
      from: fromHeader,
      fromAddress
    };
  }

  hasSmtpConfig(config = {}) {
    return Boolean(config.host && config.fromAddress && config.user && config.pass);
  }

  async isSmtpConfigured() {
    const config = await this.getSmtpConfig();
    return this.hasSmtpConfig(config);
  }

  async sendQueuedPending(limit = 10) {
    if (!this.models.BookingEmailQueue) return { processed: 0 };
    if (!await this.isSmtpConfigured()) return { processed: 0, skipped: 'smtp_not_configured' };

    const Op = this.models.BookingEmailQueue.sequelize.Sequelize.Op;
    const rows = await this.models.BookingEmailQueue.findAll({
      where: {
        status: 'pending',
        scheduled_at: { [Op.lte]: new Date() }
      },
      order: [['scheduled_at', 'ASC']],
      limit
    });

    const sendableRows = rows.filter(item => Number(item.attempts || 0) < Number(item.max_attempts || 5));
    for (const row of sendableRows) {
      await this.sendQueueRow(row);
    }

    return { processed: sendableRows.length };
  }

  async sendQueueRow(row) {
    const attempts = Number(row.attempts || 0) + 1;
    await row.update({ status: 'processing', attempts, last_attempt_at: new Date(), error_message: null });

    try {
      const config = await this.getSmtpConfig();
      const response = await this.sendMail(config, {
        to: row.recipient_email,
        subject: row.subject,
        html: row.html_body,
        text: row.text_body
      });
      await row.update({
        status: 'sent',
        sent_at: new Date(),
        provider_response: response || {},
        error_message: null
      });
    } catch (error) {
      const isFinal = attempts >= Number(row.max_attempts || 5);
      const nextRun = new Date(Date.now() + Math.min(60 * attempts, 15 * 60) * 1000);
      await row.update({
        status: isFinal ? 'failed' : 'pending',
        scheduled_at: isFinal ? row.scheduled_at : nextRun,
        error_message: error.message
      });
    }
  }

  async sendMail(config, message) {
    if (!this.hasSmtpConfig(config)) {
      throw new Error('Booking mail host, sender email, username, and app password are required to send booking emails.');
    }

    const boundary = `boundary_${Date.now().toString(36)}`;
    const headers = [
      `From: ${config.from}`,
      `To: ${message.to}`,
      `Subject: ${message.subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`
    ].join('\r\n');
    const body = [
      `--${boundary}`,
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      message.text || '',
      `--${boundary}`,
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      message.html || '',
      `--${boundary}--`
    ].join('\r\n');

    return this.smtpSend(config, {
      from: config.fromAddress,
      to: message.to,
      data: `${headers}\r\n\r\n${body}`
    });
  }

  smtpSend(config, envelope) {
    return new Promise((resolve, reject) => {
      let socket = null;
      let buffer = '';
      const commands = [];
      const readLine = () => new Promise((resolveLine, rejectLine) => {
        const onData = (chunk) => {
          buffer += chunk.toString('utf8');
          const lines = buffer.split(/\r?\n/);
          const complete = lines.find(line => /^\d{3} /.test(line));
          if (!complete) return;
          socket.off('data', onData);
          buffer = '';
          resolveLine(complete);
        };
        socket.on('data', onData);
        socket.once('error', rejectLine);
      });
      const send = async (command, expected = /^[23]/) => {
        socket.write(`${command}\r\n`);
        const response = await readLine();
        if (!expected.test(response)) throw new Error(`SMTP error after ${command}: ${response}`);
        return response;
      };
      const connect = config.secure
        ? tls.connect({ host: config.host, port: config.port, servername: config.host })
        : net.connect({ host: config.host, port: config.port });

      socket = connect;
      socket.setTimeout(30000);
      socket.once('timeout', () => reject(new Error('SMTP connection timed out.')));
      socket.once('error', reject);
      socket.once('connect', async () => {
        try {
          await readLine();
          await send(`EHLO ${config.host}`);

          if (!config.secure && Number(config.port) === 587) {
            await send('STARTTLS', /^220/);
            socket = tls.connect({ socket, servername: config.host });
            await new Promise((res, rej) => {
              socket.once('secureConnect', res);
              socket.once('error', rej);
            });
            await send(`EHLO ${config.host}`);
          }

          if (config.user && config.pass) {
            const auth = Buffer.from(`\0${config.user}\0${config.pass}`).toString('base64');
            await send(`AUTH PLAIN ${auth}`, /^235/);
          }

          await send(`MAIL FROM:<${envelope.from}>`);
          await send(`RCPT TO:<${envelope.to}>`);
          await send('DATA', /^354/);
          socket.write(`${envelope.data}\r\n.\r\n`);
          const queued = await readLine();
          if (!/^[23]/.test(queued)) throw new Error(`SMTP send failed: ${queued}`);
          commands.push(queued);
          await send('QUIT', /^221/).catch(() => null);
          socket.end();
          resolve({ response: queued });
        } catch (error) {
          if (socket) socket.destroy();
          reject(error);
        }
      });
    });
  }
}

module.exports = BookingEmailService;
