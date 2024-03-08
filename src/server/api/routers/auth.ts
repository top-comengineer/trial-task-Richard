import { z } from 'zod';
import { createTRPCContext } from '../trpc';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;


export const RegisterRouter = createTRPCRouter({
  register: publicProcedure.input(z.object({ email: z.string(), password: z.string()})).mutation(async ({ctx, input})=> {
    const { email, password } = input;
    const exists = await ctx.db.user.findFirst({
      where: { email },
    });

    const defaultAddress = '0xbDA89e079e8E71D78c144773b243CD2244707095'

    if (exists) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "User already exists.",
      });
    }

    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    const hash = bcrypt.hashSync(password, salt);

    const result = await ctx.db.user.create({
    data: {  
      email, 
      password: hash,
      address: defaultAddress}
    })


    return result
  }),

  updateWalletAddress: protectedProcedure.input(z.object({email: z.string(), address: z.string()})).mutation(async ({ctx, input}) => {
    const {email, address} = input;

    const updatedUser = await ctx.db.user.update({
      where: {email},
      data: {
        address
      }
    })

    if(updatedUser) {
      return updatedUser;
    } else {
      throw new TRPCError({
        code: 'CONFLICT',
        message: "User does not exist."
      })
    }
  })
})