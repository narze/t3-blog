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
  .query("getById", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const post = await ctx.prisma.post.findFirst({
        where: {
          id: input.id,
        },
        include: {
          user: true,
        },
      })

      if (!post) {
        throw new trpc.TRPCError({ code: "NOT_FOUND" })
      }

      return post
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

      // If have more than 5 posts, delete the oldest one
      const posts = await ctx.prisma.post.findMany({
        where: {
          userId: ctx.session.user.id,
        },
      })

      if (posts.length >= 5) {
        await ctx.prisma.post.delete({
          where: {
            id: posts[0]!.id,
          },
        })
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
