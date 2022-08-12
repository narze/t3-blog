import { createRouter } from "./context"

export const postsRouter = createRouter().query("getAll", {
  async resolve({ ctx }) {
    return await ctx.prisma.post.findMany({
      include: {
        user: true,
      },
    })
  },
})
