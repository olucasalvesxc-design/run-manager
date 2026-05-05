import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

function getDb() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      } as admin.ServiceAccount),
    });
  }
  const databaseId = process.env.FIREBASE_DATABASE_ID || '(default)';
  return getFirestore(admin.apps[0]!, databaseId);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body;
  console.log('Kirvano Webhook received:', JSON.stringify(payload, null, 2));

  const { event, data } = payload;

  if (event === 'order.approved' || event === 'subscription.active') {
    const email = data?.customer?.email?.toLowerCase();
    const productName = data?.product_name?.toUpperCase();

    let planName = 'START';
    if (productName?.includes('PRO')) planName = 'PRO RUNNER';
    if (productName?.includes('MASTER') || productName?.includes('ELITE')) planName = 'MASTER ELITE';

    if (email) {
      try {
        const db = getDb();
        const profilesRef = db.collection('profiles');
        const snapshot = await profilesRef.where('email', '==', email).limit(1).get();

        if (!snapshot.empty) {
          const docRef = snapshot.docs[0];
          await docRef.ref.update({
            planName,
            planStatus: 'active',
            subscriptionId: data.subscription_id || data.order_id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`Updated plan for ${email} to ${planName}`);
        } else {
          console.log(`Profile not found for email: ${email}`);
        }
      } catch (err) {
        console.error('Error updating profile via webhook:', err);
      }
    }
  }

  res.sendStatus(200);
}
