import { createSSGHelpers } from "@trpc/react/ssg"
import {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next"
import { prisma } from "../../server/db/client"
// import { appRouter } from 'server/routers/_app';
import superjson from "superjson"
import { appRouter } from "../../server/router"
// import { trpc } from 'utils/trpc';
import { createContext } from "../../server/router/context"
import { trpc } from "../../utils/trpc"
import Head from "next/head"
import LoginButton from "../../components/login-button"
import Link from "next/link"

export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>
) {
  const ssg = await createSSGHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson, // optional - adds superjson serialization
  })
  const id = context.params?.id as string

  await ssg.fetchQuery("posts.getById", {
    id,
  })

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
    revalidate: 1,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
    },
  })

  return {
    paths: posts.map((post) => ({
      params: {
        id: post.id,
      },
    })),
    // https://nextjs.org/docs/basic-features/data-fetching#fallback-blocking
    fallback: "blocking",
  }
}

export default function PostViewPage(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const { id } = props
  const postQuery = trpc.useQuery(["posts.getById", { id }])

  if (postQuery.status !== "success") {
    // won't happen since we're using `fallback: "blocking"`
    return <>Loading...</>
  }
  const { data: post } = postQuery

  return (
    <>
      <Head>
        <title>T3 Blog</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
        <nav className="navbar fixed top-0 w-full gap-4 bg-base-300">
          <span className="flex-1">T3 Blog</span>

          <LoginButton />
        </nav>

        <section className="flex flex-col justify-start w-full gap-4 mt-8">
          <h2 key={post.id} className="text-2xl">
            {post.title}
          </h2>
          <p>{post.content}</p>
          <small>
            by {post.user.name} ({post.user.email})
          </small>

          <Link href={"/"}>
            <a>Home</a>
          </Link>
        </section>
      </main>
    </>
  )
}