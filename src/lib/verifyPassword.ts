import { compare } from "bcryptjs";

export default async function verifyPassword(password: string, hashedPassword: string) {
  console.log('hashedpassword',hashedPassword )
  const isValid = await compare(hashedPassword, password);
  console.log('isValid', isValid)
  return isValid;
}
