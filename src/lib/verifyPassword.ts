import { compare } from "bcryptjs";

export default async function verifyPassword(password: string, hashedPassword: string) {
  const isValid = await compare(hashedPassword, password);
  return isValid;
}
