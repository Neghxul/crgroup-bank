import express from "express";
import { addCard, deleteCard, getCard, getCards, updateCard } from "../controllers/card.js";

const router = express.Router();

router.get("/:id", getCard);
router.get("/", getCards);
router.post("/", addCard);
router.delete("/:id", deleteCard);
router.put("/:id", updateCard);

export default router;
