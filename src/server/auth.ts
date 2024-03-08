import { PrismaAdapter } from "@auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";

import { env } from "@/env";
import { db } from "@/server/db";
import { getUser } from "./getUser";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      email: string,
    };
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */

export const authOptions: NextAuthOptions = {

  // adapter: PrismaAdapter(db) as Adapter,
  providers: [
    CredentialsProvider({
      credentials: {},
      async authorize(credentials, req): Promise<any> {
        try {
        const { email, password } = credentials as {
          email: string
          password: string
        }
        const user = await getUser(email, password);

        if(user) {
          return {email: user.email} as object
        }
        } catch (e) {
        return null
        }
      }
    })
  ],
  // callbacks: {
  //   async session (props: {session: any, token: any}) {
  //     const { session, token } = props;
  //     // const exp = new Date(new Date().getTime() + 60*1000).toISOString();
  //     // session.expires = exp;
  //     return session
  //   }
  // },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
