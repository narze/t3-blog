import { z } from "zod"
import * as trpc from "@trpc/server"

import { createRouter } from "./context"

export const postsRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.post.findMany({
        include: {
          user: true,
        },
      })
    },
  })
  .mutation("create", {
    input: z.object({
      title: z.string(),
      content: z.string(),
    }),
    async resolve({ input, ctx }) {
      if (!ctx.session || !ctx.session.user) {
        throw new trpc.TRPCError({ code: "UNAUTHORIZED" })
      }

      // Create new post
      const post = await ctx.prisma.post.create({
        data: {
          title: input.title,
          content: input.content,
          userId: ctx.session.user.id,
        },
      })

      return {
        post,
      }
    },
  })
