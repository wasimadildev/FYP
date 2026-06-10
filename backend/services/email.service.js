const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: parseInt(process.env.SMTP_PORT, 10) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  return t.sendMail({
    from: `"MedChain" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

async function sendVerificationEmail(to, token) {
  const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  return sendEmail({
    to,
    subject: 'Verify your MedChain account',
    html: `<h2>Welcome to MedChain</h2><p>Click <a href="${link}">here</a> to verify your email address.</p>`,
  });
}

async function sendAppointmentReminder(to, date, doctorName) {
  return sendEmail({
    to,
    subject: 'Appointment Reminder - MedChain',
    html: `<h2>Appointment Reminder</h2><p>You have an appointment with Dr. ${doctorName} on ${new Date(date).toLocaleString()}.</p>`,
  });
}

async function sendConsentNotification(to, doctorName, action) {
  return sendEmail({
    to,
    subject: `Consent ${action} - MedChain`,
    html: `<h2>Consent ${action}</h2><p>Dr. ${doctorName} has ${action} access to your health records.</p>`,
  });
}

module.exports = { sendEmail, sendVerificationEmail, sendAppointmentReminder, sendConsentNotification };
