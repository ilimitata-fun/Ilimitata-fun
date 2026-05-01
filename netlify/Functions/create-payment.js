exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }, body: '' };
  }
  try {
    const { amount, performerName, bookingDate, bookingTime, clientEmail, clientName } = JSON.parse(event.body);
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${secretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ amount: Math.round(amount * 100).toString(), currency: 'usd', receipt_email: clientEmail, description: `Ilimitata FUN - ${performerName} on ${bookingDate}` }).toString()
    });
    const paymentIntent = await response.json();
    if (paymentIntent.error) return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }, body: JSON.stringify({ error: paymentIntent.error.message }) };
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }, body: JSON.stringify({ clientSecret: paymentIntent.client_secret }) };
  } catch (error) {
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }, body: JSON.stringify({ error: error.message }) };
  }
};
