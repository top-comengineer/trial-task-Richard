import verifyPassword from "@/lib/verifyPassword";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUser = async (email: string, password: string) => {
  let user = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  let users = await prisma.user.findMany();

  
  console.log('user', user, users)
  if(!user) {
    return null
  } else {
    const isValids = await verifyPassword(user?.password, password)

    const isValid = (user.password === password);

    console.log('isvalid', isValid);
    if(!isValid) {
      return null;
    } else {
      return user;
    }
  }
}