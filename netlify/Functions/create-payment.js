const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { amount, performerName, bookingDate, bookingTime, clientEmail, clientName } = JSON.parse(event.body);

    // Calculate platform fee (10%)
    const platformFee = Math.round(amount * 0.10);

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe uses cents
      currency: 'usd',
      receipt_email: clientEmail,
      description: `Ilimitata FUN — ${performerName} on ${bookingDate} at ${bookingTime}`,
      metadata: {
        performer  : performerName,
        date       : bookingDate,
        time       : bookingTime,
        client     : clientName,
        platform_fee: platformFee
      }
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type'                : 'application/json'
      },
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        platformFee : platformFee
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
