import { Router } from "express";
import {
  getAgentStats,
  getAgentProperties,
  getAgentBookings,
  getAgentUsers,
  updateProperty,
  deleteProperty,
  createProperty,
  updateUserRole,
} from "../controllers/agent.controller";
import { protect, restrictTo } from "../middleware/auth";

const router = Router();

router.use(protect);
router.use(restrictTo("AGENT"));

router.get("/stats", getAgentStats);
router.get("/properties", getAgentProperties);
router.get("/bookings", getAgentBookings);
router.get("/users", getAgentUsers);

router.post("/properties", createProperty);
router.put("/properties/:id", updateProperty);
router.delete("/properties/:id", deleteProperty);

router.put("/users/:id/role", updateUserRole);
router.put("/bookings/:id/status", updateBookingStatus);

export default router;

function updateBookingStatus(_req: any, _res: any, next: any) {
  return next();
}
