import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';

// Initialize Firebase Admin (once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { event, data } = req.body;
    console.log('Kirvano webhook:', event, data?.customer?.email);

    if (event === 'order.approved' || event === 'subscription.active') {
      const email       = data?.customer?.email?.toLowerCase();
      const productName = (data?.product_name ?? '').toUpperCase();

      let planName = 'START';
      if (productName.includes('PRO'))                              planName = 'PRO RUNNER';
      if (productName.includes('MASTER') || productName.includes('ELITE')) planName = 'MASTER ELITE';

      if (email) {
        const snap = await db.collection('profiles').where('email', '==', email).limit(1).get();
        if (!snap.empty) {
          await snap.docs[0].ref.update({
            planName,
            planStatus:     'active',
            subscriptionId: data.subscription_id ?? data.order_id,
            updatedAt:      admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`Updated ${email} → ${planName}`);
        }
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
