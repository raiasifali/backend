const stripe = require('stripe')(
  'sk_test_51OwuO4LcfLzcwwOYsXYljgE1gUyGnLFvjewSf1NG9CsrSqTsxm7n7ppmZ2ZIFL01ptVDhuW7LixPggik41wWmOyE00RjWnYxUA'
);
const subscriptionModel = require('../../models/subscription/subscription');
const authModel = require('../../models/auth/auth');

module.exports.createSubscription = async (req, res) => {
  try {
    const { subtype, amount, sessionId, name } = req.body;
    const userEmail = req.user.email;

    // Find the latest subscription for the given email
    const lastSubscription = await subscriptionModel
      .findOne({ email: userEmail })
      .sort({ expires_at: -1 });

    // Check if there is a last subscription and if it's still active
    if (lastSubscription) {
      const currentDate = new Date();

      if (
        (lastSubscription === 'active' &&
          subtype === 'month' &&
          lastSubscription.subtype === 'month' &&
          new Date(lastSubscription.expires_at) > currentDate) ||
        (subtype === 'year' &&
          lastSubscription.subtype === 'year' &&
          new Date(lastSubscription.expires_at) > currentDate)
      ) {
        return res.status(400).json({
          error: 'Active subscription already exists',
        });
      }
    }

    // Calculate the new expiration date
    const expires_at = calculateExpiryDate(subtype);

    // Create new subscription data
    const newSubscription = await subscriptionModel.create({
      email: userEmail,
      name: name,
      expires_at,
      amount: amount,
      subtype: subtype,
      sessionId,
    });

    // Save the new subscription to the database
    if (newSubscription) {
      await authModel.findOneAndUpdate(
        {
          email: userEmail,
        },
        {
          subscription: newSubscription._id,
        }
      );
    }

    res.status(200).json({
      message: 'Subscription created successfully',
      data: {
        sessionId: sessionId,
        expires_at,
        amount: amount,
        subtype: subtype,
        name,
      },
    });
  } catch (e) {
    console.log(e.message);
    return res.status(400).json({
      error: 'Server error, please try again',
    });
  }
};
module.exports.cancelSubscription = async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    // Retrieve the Checkout Session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Check if the session has a subscription
    if (session.subscription) {
      const subscriptionId = session.subscription;

      // Cancel the subscription
      const deletedSubscription = await stripe.subscriptions.del(
        subscriptionId
      );

      if (deletedSubscription.status === 'canceled') {
        await subscriptionModel.findOneAndUpdate(
          {
            sessionId,
          },
          {
            status: 'canceled',
          }
        );
        res.status(200).json({
          success: true,
          message: 'Subscription canceled successfully',
        });
      } else {
        res.status(400).json({ error: 'Subscription cancellation failed' });
      }
    } else {
      res
        .status(400)
        .json({ error: 'No subscription associated with this session' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: error.message });
  }
};

function calculateExpiryDate(subscriptionType) {
  const currentDate = new Date();
  let expiresAt;

  if (subscriptionType === 'month') {
    // Set the date to one month from today
    expiresAt = new Date(currentDate);
    expiresAt.setMonth(currentDate.getMonth() + 1);
  } else if (subscriptionType === 'year') {
    // Set the date to one year from today
    expiresAt = new Date(currentDate);
    expiresAt.setFullYear(currentDate.getFullYear() + 1);
  } else {
    throw new Error('Invalid subscription type');
  }

  // Adjust day to the day before to meet the requirement
  expiresAt.setDate(currentDate.getDate() - 1);

  return expiresAt;
}
function toQueryString(obj) {
  const params = new URLSearchParams(obj);
  return params.toString();
}
module.exports.createSession = async (req, res) => {
  let { title, price, subscriptionType } = req.body;
  console.log(price);
  try {
    const customer = await stripe.customers.create({
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phoneNumber,
    });
    const subscriptionData = {
      email: req.user.email,
      name: title,
      expires_at: calculateExpiryDate(req.body.subscriptionType),
      amount: req.body.price,
      subtype: req.body.subscriptionType,
    };
    const queryString = toQueryString(subscriptionData);

    const session = await stripe.checkout.sessions.create({
      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}&${queryString}`,
      customer: customer.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'UR subscription',
              description: title,
            },
            unit_amount: price * 100,
            recurring: {
              interval: subscriptionType,
            },
          },
        },
      ],
      mode: 'subscription',
    });
    res.status(200).json({
      session,
    });
  } catch (e) {
    console.log(e.message);
    return res.status(400).json({
      error: 'Server error please try again',
    });
  }
};

module.exports.webhooks = async (req, res) => {
  let endpointSecret =
    'whsec_b82d718fbae44ab38035f9ce59915a1c5c7870d001c5d90f38cab27b8e52a15c';
  let event;
  const sig = req.headers['stripe-signature'];
  const rawBody = req.rawBody;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.log('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Checkout Session completed:', session);
      const subscriptionData = {
        email: session.customer_details.email,
        name: session.customer_details.name,
        expires_at: new Date(session.expires_at * 1000),
        amount: session.amount_total / 100,
        subtype: session.mode === 'subscription' ? 'monthly' : 'one-time',
      };

      try {
        const subscription = await subscriptionModel.create(subscriptionData);
        console.log('Subscription stored:', subscription);
      } catch (error) {
        console.error('Error storing subscription:', error.message);
        return res.status(500).send('Internal server error');
      }

      break;
    case 'checkout.session.failed':
      const failedSession = event.data.object;
      console.log('Checkout Session failed:', failedSession);

      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
