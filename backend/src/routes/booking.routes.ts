import { Router } from "express"
import {
  createBooking,
  getAllBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
} from "../controllers/booking.controller"
import { protect } from "../middleware/auth"

const router = Router()

router.use(protect) 

router.post("/", createBooking)
router.get("/", getAllBookings)
router.get("/:id", getBookingById)
router.post("/:id/cancel", cancelBooking)
router.put("/:id/status", updateBookingStatus)

export default router
