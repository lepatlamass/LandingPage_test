import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51TjayeBGFddGjctCvCtMvB7dG6wptlDepGuUcsqwPbdR23HFBkWjWKrP0ufvHi1CR5Hj6Q6STjCQrWKEo2poMwhV00GLXI5lIE');

async function test() {
  try {
    const customers = await stripe.customers.list({
      email: 'test@example.com', // use a dummy or a real email from db
      limit: 1,
    });
    console.log('Customers list success:', customers.data.length);
    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });
      console.log('Subscriptions list success:', subscriptions.data.length);
    } else {
      // Let's just try to list subscriptions generally
      const subscriptions = await stripe.subscriptions.list({
        status: 'active',
        limit: 1,
      });
      console.log('General subscriptions list success:', subscriptions.data.length);
    }
  } catch (error) {
    console.error('Stripe API error:', error);
  }
}

test();
