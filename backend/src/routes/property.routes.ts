import { Router } from "express";
import {
  getAllProperties,
  getPropertyById,
  getFeaturedProperties,
  searchProperties,
  getPropertiesByAgent, 
} from "../controllers/property.controller";


const router = Router();

router.get("/", getAllProperties);
router.get("/featured", getFeaturedProperties);
router.get("/search", searchProperties);
router.get("/agent/:agentId", getPropertiesByAgent); 
router.get("/:id", getPropertyById);

export default router;
