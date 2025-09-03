import { Router } from "express"
import { toggleFavorite, getAllFavorites } from "../controllers/favorite.controller"
import { protect } from "../middleware/auth"

const router = Router()

router.use(protect) 

router.post("/", toggleFavorite)
router.get("/", getAllFavorites)

export default router
