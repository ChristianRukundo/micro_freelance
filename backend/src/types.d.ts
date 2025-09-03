import type { User } from "@prisma/client"

declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

// No export needed for declaration files
