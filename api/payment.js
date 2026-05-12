// api/payment.js — Vercel Serverless Function
// Генерує підпис для WayForPay щоб secret key не потрапив у фронтенд

const crypto = require('crypto');

const MERCHANT_ACCOUNT  = 'mystiora_com';
const MERCHANT_DOMAIN   = 'mystiora.com';
const MERCHANT_SECRET   = process.env.WFP_SECRET_KEY; // зберігаємо в Vercel env
const PRODUCT_NAME      = 'Персональний аналіз тривожності — Protocol';
const PRICE             = 99;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { orderRef, orderDate, amount } = req.body;

    if (!orderRef || !orderDate || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Рядок для підпису: merchantAccount;merchantDomainName;orderRef;orderDate;amount;currency;productName;productCount;productPrice
    const signString = [
      MERCHANT_ACCOUNT,
      MERCHANT_DOMAIN,
      orderRef,
      orderDate,
      amount,
      'UAH',
      PRODUCT_NAME,
      1,           // productCount
      PRICE        // productPrice
    ].join(';');

    const signature = crypto
      .createHmac('md5', MERCHANT_SECRET)
      .update(signString)
      .digest('hex');

    return res.status(200).json({ signature, orderRef });

  } catch (err) {
    console.error('Payment API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
