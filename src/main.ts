import { blue } from "@std/fmt/colors"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { serveStatic } from "hono/deno"
import { logger } from "hono/logger"

const app = new Hono()

app.use(logger())
app.use(cors())

app.get("/", (c) => {
  return c.text("Hello Hono!")
})

app.use("/public/*", serveStatic({ root: "./" }))

app.notFound((c) => c.json({ message: "Not found" }, 404))

const msg = `🔥 Hono server started at ${blue("http://localhost:8000")}`
Deno.serve({ onListen: () => console.log(msg) }, app.fetch)
