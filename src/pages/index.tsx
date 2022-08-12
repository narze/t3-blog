import type { NextPage } from "next"
import Head from "next/head"
import { trpc } from "../utils/trpc"
import LoginButton from "../components/login-button"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useState } from "react"

const Home: NextPage = () => {
  const getAllPosts = trpc.useQuery(["posts.getAll"])
  const posts = getAllPosts.data ?? []

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

        <section className="flex flex-col items-center justify-center">
          <h1 className="text-3xl">Posts</h1>

          <div className="flex flex-col justify-center gap-4 mt-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <a className="link link-hover">
                  <h2 key={post.id} className="text-2xl">
                    {post.title}
                  </h2>
                  {post.content.length > 280 ? (
                    <p>{post.content.substring(0, 280)}...</p>
                  ) : (
                    <p>{post.content}</p>
                  )}
                  <small>by {post.user.name}</small>
                </a>
              </Link>
            ))}
          </div>

          <NewPostForm onCreate={getAllPosts.refetch} />
        </section>
      </main>
    </>
  )
}

const NewPostForm = ({ onCreate }: { onCreate: () => void }) => {
  const { data } = useSession()
  const mutation = trpc.useMutation(["posts.create"])
  const [title, setTitle] = useState("New Post")
  const [content, setContent] = useState("")

  const createPost = async () => {
    setTitle("")
    setContent("")

    mutation.mutate(
      { title, content },
      {
        onSuccess: () => {
          onCreate()
        },
      }
    )
  }

  if (!data?.user) {
    // Render a login button
    return <LoginButton />
  }

  // Render the post form
  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        className="input input-bordered"
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
      />
      <textarea
        className="textarea textarea-bordered"
        value={content}
        onChange={(e) => setContent(e.currentTarget.value)}
      />
      <button className="btn" onClick={createPost}>
        Create Post
      </button>
    </div>
  )
}

export default Home
