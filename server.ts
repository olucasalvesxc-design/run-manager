import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let db: any;

const configPath = path.join(process.cwd(), "firebase-applet-config.json");
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const app = admin.initializeApp({
    projectId: config.projectId,
  });
  db = getFirestore(app, config.firestoreDatabaseId);
} else {
  const app = admin.initializeApp();
  db = getFirestore(app);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Kirvano Webhook
  app.post("/api/webhooks/kirvano", async (req, res) => {
    const payload = req.body;
    console.log("Kirvano Webhook received:", JSON.stringify(payload, null, 2));
    
    // Kirvano event usually: { "event": "order.approved", "data": { "product_name": "...", "customer": { "email": "..." } } }
    const { event, data } = payload;

    if (event === 'order.approved' || event === 'subscription.active') {
      const email = data.customer?.email?.toLowerCase();
      const productName = data.product_name?.toUpperCase();
      
      let planName = 'START';
      if (productName?.includes('PRO')) planName = 'PRO RUNNER';
      if (productName?.includes('MASTER') || productName?.includes('ELITE')) planName = 'MASTER ELITE';

      if (email) {
        try {
          const profilesRef = db.collection('profiles');
          const snapshot = await profilesRef.where('email', '==', email).limit(1).get();

          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            await doc.ref.update({
              planName,
              planStatus: 'active',
              subscriptionId: data.subscription_id || data.order_id,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`Updated plan for ${email} to ${planName}`);
          } else {
            console.log(`Profile not found for email: ${email}`);
          }
        } catch (err) {
          console.error("Error updating profile via webhook:", err);
        }
      }
    }

    res.sendStatus(200);
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
