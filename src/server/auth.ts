// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { type GetServerSidePropsContext } from "next";
// import {
//   getServerSession,
//   type DefaultSession,
//   type NextAuthOptions,
// } from "next-auth";
// import { type Adapter } from "next-auth/adapters";
// import DiscordProvider from "next-auth/providers/discord";
// import CredentialsProvider from "next-auth/providers/credentials";

// import { env } from "@/env";
// import { db } from "@/server/db";
// import { getUser } from "./getUser";

// /**
//  * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
//  * object and keep type safety.
//  *
//  * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
//  */
// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user: {
//       email: string;
//       userId: number;
//       address: string;
//     };
//   }

//   // interface User {
//   //   // ...other properties
//   //   // role: UserRole;
//   // }
// }

// /**
//  * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
//  *
//  * @see https://next-auth.js.org/configuration/options
//  */

// export const authOptions: NextAuthOptions = {
//   // adapter: PrismaAdapter(db) as Adapter,
//   providers: [
//     CredentialsProvider({
//       credentials: {},
//       async authorize(credentials, req): Promise<any> {
//         try {
//           const { email, password } = credentials as {
//             email: string;
//             password: string;
//           };
//           const user = await getUser(email, password);
//           console.log("user==========>", user);
//           if (user) {
//             return {
//               email: user.email,
//               userId: user.user_id,
//               address: user.address,
//             } as object;
//           }
//         } catch (e) {
//           return null;
//         }
//       },
//     }),
//   ],
//   callbacks: {
//     async session(props: { session: any; token: any }) {
//       console.log("----------->", props);
//       const { session, token } = props;
//       if (token.userId) {
//         session.user.userId = token.userId;
//       }
//       console.log("adfadsfsdalfkweoifnwefinawefnaweflnasdlfkandlf", session);
//       // session.name =
//       // const exp = new Date(new Date().getTime() + 60*1000).toISOString();
//       // session.expires = exp;
//       return session;
//     },
//     async jwt({ token, user }) {
//       // If the user object exists, it means this is the first time the JWT callback is being called
//       // and the user has just logged in. In this case, you can attach the userId to the token.
//       /*
//       {
//         token: {
//           email: 'britness.gmd@gmail.com',
//           iat: 1710272127,
//           exp: 1712864127,
//           jti: 'eaf340de-948c-4fff-99a2-613ee70dbf07'
//         },
//         session: undefined
//       }
//       */

//       if (user) {
//         const customUser = user as any; // Now `customUser` is treated as any type, which bypasses type checks
//         // console.log(
//         //   "customUser------------------------------------------------",
//         //   customUser,
//         // );
//         token.userId = customUser.userId; // TypeScript will not complain here
//         // console.log("token--------------------------------------------", token);
//       }

//       return token;
//     },
//   },
// };

// /**
//  * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
//  *
//  * @see https://next-auth.js.org/configuration/nextjs
//  */

import NextAuth, { NextAuthOptions } from "next-auth";
// Import the exact providers you are using.
import CredentialsProvider from "next-auth/providers/credentials";
import { type GetServerSidePropsContext } from "next";
import { getServerSession, type DefaultSession } from "next-auth";
// If you use other providers, import them similarly.
import { JWT } from "next-auth/jwt";

// Adjust this import based on your actual database adapter.
//import { PrismaAdapter } from "@next-auth/prisma-adapter";
//import prisma from "@/server/db"; // Adjust based on your actual Prisma setup

// Update your user fetching logic as needed.
import { getUser } from "./getUser";

declare module "next-auth" {
  // This extends the built-in session and user model with additional fields.
  interface Session {
    user: {
      email: string;
      userId: number;
      address?: string;
      token?: string; // Optionally add token
    };
  }

  interface User {
    userId: number;
    address?: string;
  }

  interface JWT {
    userId?: number;
    token?: string;
  }
}

export const authOptions: NextAuthOptions = {
  // Uncomment and adjust if you are using a database with Prisma
  //adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        // Define the fields your credentials provider needs
      },
      async authorize(credentials, req): Promise<any> {
        if (credentials) {
          const { email, password } = credentials as {
            email: string;
            password: string;
          };
          // Implement your check logic here
          const user = await getUser(email, password);
          if (user) {
            // Assuming the getUser function returns an object with email and userId
            // You might want to generate or fetch a token here as per your auth logic
            return { email: user.email, userId: user.user_id };
          }
        }
        // Return null if user data could not be retrieved
        return null;
      },
    }),
    // List other providers you might be using
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On sign in, pass the user's id into the token
      if (user) {
        token.userId = user.userId;
        // Here you could also add a real token if needed
        token.token = "user-specific-token";
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.userId = token.userId as number;
        session.user.token = token.token; // Optional: Add token to the user session
      }
      return session;
    },
  },
  // Add any additional NextAuth configuration options here
};

export default NextAuth(authOptions);

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
