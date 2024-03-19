import verifyPassword from "@/lib/verifyPassword";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUser = async (email: string, password: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    
    if(!user) {
      return null
    } else {
      const isValid = await verifyPassword(user?.password, password)
  
      if(!isValid) {
        return null;
      } else {
        return user;
      }
    }
  } catch(e) {
    console.log('error', e)
  }
  
}
