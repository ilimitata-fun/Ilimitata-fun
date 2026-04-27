exports.handler = async (event) => {
// Handle CORS preflight
if (event.httpMethod === ‘OPTIONS’) {
return {
statusCode: 200,
headers: {
‘Access-Control-Allow-Origin’: ‘*’,
‘Access-Control-Allow-Headers’: ‘Content-Type’,
‘Access-Control-Allow-Methods’: ‘POST, OPTIONS’
},
body: ‘’
};
}

if (event.httpMethod !== ‘POST’) {
return { statusCode: 405, body: ‘Method Not Allowed’ };
}

try {
const { amount, performerName, bookingDate, bookingTime, clientEmail, clientName } = JSON.parse(event.body);

```
const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  return {
    statusCode: 500,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ error: 'Stripe secret key not configured' })
  };
}

// Calculate platform fee (10%)
const platformFee = Math.round(amount * 0.10);
const totalCents = Math.round(amount * 100);

// Call Stripe API directly using fetch — no npm package needed!
const response = await fetch('https://api.stripe.com/v1/payment_intents', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${secretKey}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    amount: totalCents.toString(),
    currency: 'usd',
    receipt_email: clientEmail,
    description: `Ilimitata FUN — ${performerName} on ${bookingDate} at ${bookingTime}`,
    'metadata[performer]': performerName,
    'metadata[date]': bookingDate,
    'metadata[time]': bookingTime,
    'metadata[client]': clientName,
    'metadata[platform_fee]': platformFee.toString()
  }).toString()
});

const paymentIntent = await response.json();

if (paymentIntent.error) {
  return {
    statusCode: 400,
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: paymentIntent.error.message })
  };
}

return {
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    clientSecret: paymentIntent.client_secret,
    platformFee: platformFee
  })
};
```

} catch (error) {
return {
statusCode: 500,
headers: { ‘Access-Control-Allow-Origin’: ‘*’, ‘Content-Type’: ‘application/json’ },
body: JSON.stringify({ error: error.message })
};
}
};
