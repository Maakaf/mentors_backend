import { Router } from "express";
import * as admin from "firebase-admin";
import { requireAuth, requireAdmin, AuthedRequest } from "../middleware/auth";
import { Topic } from "../types";

const router = Router();
const db = () => admin.firestore();

// GET /topics
router.get("/", async (_req, res) => {
  try {
    const snap = await db().collection("topics").orderBy("name").get();
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    console.error("GET /topics error:", err);
    res.status(500).json({ error: { code: "INTERNAL_ERROR" } });
  }
});

// POST /topics
router.post("/", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { name } = req.body as Partial<Topic>;
    if (!name || typeof name !== "string") {
      res.status(400).json({ error: { code: "MISSING_FIELDS" } });
      return;
    }
    const ref = await db().collection("topics").add({ name });
    res.status(201).json({ id: ref.id, name });
  } catch (err) {
    console.error("POST /topics error:", err);
    res.status(500).json({ error: { code: "INTERNAL_ERROR" } });
  }
});

export default router;
