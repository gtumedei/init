/** @jsxImportSource hono/jsx */

import { blue } from "@std/fmt/colors"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { serveStatic } from "hono/deno"
import { logger } from "hono/logger"
import { templateRoutes } from "~/routes/template.tsx"

import templatesJson from "~/templates.json" with { type: "json" }

const [templates, aliases] = Object.entries(templatesJson)
  .map(([k, v]) => ({ slug: k, ...v }))
  .reduce(
    (acc, template) => {
      if ("alias" in template) acc[1].push(template)
      else acc[0].push(template)
      return acc
    },
    [[], []] as [
      { slug: string; title: string; description: string }[],
      { slug: string; alias: string }[],
    ],
  )

const app = new Hono()

app.use(logger())
app.use(cors())

app.get("/", (c) => c.redirect(`/${templates[0].slug}`))

app.use("/*", serveStatic({ root: "./public" }))

templates.forEach((template) => app.route(`/${template.slug}`, templateRoutes(template)))

aliases.forEach((alias) => app.get(`/${alias.slug}`, (c) => c.redirect(`/${alias.alias}`)))

app.notFound((c) => c.json({ message: "Not found" }, 404))

const msg = `🔥 Hono server started at ${blue("http://localhost:8000")}`
Deno.serve({ onListen: () => console.log(msg) }, app.fetch)
