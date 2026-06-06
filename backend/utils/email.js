const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM,
  },
});

const baseStyles = `
  body { margin: 0; padding: 0; background-color: #0A0E0D; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
  .container { max-width: 600px; margin: 0 auto; background-color: #151C1A; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); }
  .header { background: linear-gradient(135deg, #0A0E0D 0%, #151C1A 100%); padding: 32px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .logo { display: inline-flex; align-items: center; gap: 12px; }
  .logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #4ade80, #059669); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; }
  .logo-text { font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
  .logo-highlight { color: #4ade80; }
  .content { padding: 32px; }
  .greeting { color: #ffffff; font-size: 20px; font-weight: 600; margin-bottom: 8px; }
  .text { color: #9ca3af; font-size: 14px; line-height: 1.6; margin-bottom: 16px; }
  .highlight-box { background: rgba(74, 222, 128, 0.05); border: 1px solid rgba(74, 222, 128, 0.15); border-radius: 12px; padding: 20px; margin: 20px 0; }
  .label { color: #4ade80; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 6px; }
  .value { color: #ffffff; font-size: 16px; font-weight: 600; }
  .value-sm { color: #ffffff; font-size: 14px; }
  .table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  .table th { text-align: left; padding: 10px 16px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #4ade80; font-weight: 600; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.06); }
  .table td { padding: 12px 16px; font-size: 13px; color: #d1d5db; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .table td.amount { text-align: right; color: #ffffff; font-weight: 600; }
  .total-row { background: rgba(74, 222, 128, 0.05); }
  .total-row td { color: #4ade80; font-weight: 700; font-size: 16px; }
  .otp-code { display: inline-block; background: rgba(74, 222, 128, 0.1); border: 2px solid rgba(74, 222, 128, 0.3); border-radius: 12px; padding: 16px 32px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #4ade80; margin: 16px 0; }
  .btn { display: inline-block; background: #22c55e; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 600; text-decoration: none; margin: 16px 0; }
  .footer { padding: 24px 32px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); }
  .footer-text { color: #6b7280; font-size: 12px; }
  .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 16px 0; }
`;

const header = `
  <div class="header">
    <div class="logo">
      <div class="logo-icon">⚡</div>
      <span class="logo-text">Vendor<span class="logo-highlight">Bridge</span></span>
    </div>
    <p style="color: #6b7280; font-size: 12px; margin-top: 8px; text-transform: uppercase; letter-spacing: 2px;">Procurement & Vendor Management</p>
  </div>
`;

const footer = `
  <div class="footer">
    <p class="footer-text">This is an automated email from VendorBridge ERP.</p>
    <p class="footer-text">Please do not reply to this email.</p>
  </div>
`;

function buildEmail(bodyContent) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${baseStyles}</style></head>
<body style="background-color: #0A0E0D; padding: 32px 16px;">
<div class="container">
  ${header}
  ${bodyContent}
  ${footer}
</div>
</body></html>`;
}

// Send OTP for email verification
async function sendVerificationOTP(email, otp, name) {
  const html = buildEmail(`
    <div class="content">
      <p class="greeting">Welcome, ${name}!</p>
      <p class="text">Please verify your email address to complete your registration on VendorBridge.</p>
      <div style="text-align: center;">
        <p class="label">Your Verification Code</p>
        <div class="otp-code">${otp}</div>
        <p class="text">This code expires in <strong style="color: #ffffff;">10 minutes</strong>.</p>
      </div>
      <div class="divider"></div>
      <p class="text" style="font-size: 12px;">If you did not create an account, please ignore this email.</p>
    </div>
  `);

  await transporter.sendMail({
    from: `"VendorBridge" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email — VendorBridge',
    html,
  });
}

// Send invoice email when quotation is approved
async function sendInvoiceEmail(invoice, vendor, po) {
  const formatCurrency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const itemRows = invoice.items.map(item => `
    <tr>
      <td>${item.product}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td class="amount">${formatCurrency(item.unitPrice)}</td>
      <td class="amount">${formatCurrency(item.total)}</td>
    </tr>
  `).join('');

  const html = buildEmail(`
    <div class="content">
      <p class="greeting">Invoice Generated</p>
      <p class="text">A new invoice has been generated for your approved quotation. Please find the details below.</p>

      <div class="highlight-box">
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <div>
            <p class="label">Invoice Number</p>
            <p class="value">${invoice.invoiceNumber}</p>
          </div>
          <div style="text-align: right;">
            <p class="label">PO Reference</p>
            <p class="value">${po.poNumber}</p>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <div>
            <p class="label">Invoice Date</p>
            <p class="value-sm">${formatDate(invoice.createdAt)}</p>
          </div>
          <div style="text-align: right;">
            <p class="label">Due Date</p>
            <p class="value-sm">${formatDate(invoice.dueDate)}</p>
          </div>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Rate</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
          <tr><td colspan="4"><div class="divider" style="margin: 0;"></div></td></tr>
          <tr>
            <td colspan="3" style="text-align: right; color: #9ca3af;">Subtotal</td>
            <td class="amount">${formatCurrency(invoice.subtotal)}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right; color: #9ca3af;">CGST (${invoice.taxRate / 2}%)</td>
            <td class="amount">${formatCurrency(invoice.cgst)}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right; color: #9ca3af;">SGST (${invoice.taxRate / 2}%)</td>
            <td class="amount">${formatCurrency(invoice.sgst)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="3" style="text-align: right;">Total Amount</td>
            <td class="amount" style="color: #4ade80; font-size: 18px;">${formatCurrency(invoice.totalAmount)}</td>
          </tr>
        </tbody>
      </table>

      <p class="text">Payment is due by <strong style="color: #ffffff;">${formatDate(invoice.dueDate)}</strong>.</p>
    </div>
  `);

  await transporter.sendMail({
    from: `"VendorBridge" <${process.env.EMAIL_USER}>`,
    to: vendor.email,
    subject: `Invoice ${invoice.invoiceNumber} — VendorBridge`,
    html,
  });
}

module.exports = { sendVerificationOTP, sendInvoiceEmail };
