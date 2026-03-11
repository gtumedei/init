/** @jsxImportSource hono/jsx */

import { blue } from "@std/fmt/colors"
import { Context, Hono } from "hono"
import { cors } from "hono/cors"
import { serveStatic } from "hono/deno"
import { logger } from "hono/logger"
import { stream } from "hono/streaming"
import { getValidatedProjectName } from "~/lib/validation.ts"
import { buildGeneratedTemplateZip } from "~/lib/zip-processor.ts"
import { TemplateFormPage } from "~/templates/template-form.tsx"

const app = new Hono()

app.use(logger())
app.use(cors())

app.get("/", (c) => {
  return c.text("Hello Hono!")
})

app.use("/templates/*", serveStatic({ root: "./public" }))

const templateZipGenerator = async (c: Context, templateName: string) => {
  const formData = await c.req.formData()
  const rawProjectName = formData.get("projectName")

  if (typeof rawProjectName !== "string") {
    return c.json({ message: "Project name is required" }, 400)
  }

  let projectName: string

  try {
    projectName = getValidatedProjectName(rawProjectName)
  } catch (error) {
    if (error instanceof Error) return c.json({ message: error.message }, 400)
    return c.json({ message: "Invalid project name" }, 400)
  }

  try {
    const templateUrl = new URL(`/templates/${encodeURIComponent(templateName)}.zip`, c.req.url)
    console.log(templateUrl)
    const templateResponse = await fetch(templateUrl, {
      signal: AbortSignal.timeout(8000),
    })

    if (templateResponse.status === 404) return c.json({ message: "Template not found" }, 404)

    if (!templateResponse.ok) {
      console.error("Template fetch failed", { templateName, status: templateResponse.status })
      return c.json({ message: "Failed to load template" }, 502)
    }

    const templateZip = new Uint8Array(await templateResponse.arrayBuffer())
    const generatedZip = await buildGeneratedTemplateZip(templateZip, projectName)

    c.header("Content-Type", "application/zip")
    c.header("Content-Disposition", `attachment; filename="${projectName}.zip"`)
    c.header("Cache-Control", "no-store")
    return stream(c, async (s) => {
      await s.write(generatedZip)
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return c.json({ message: "Template source timed out" }, 504)
    }

    console.error("Failed to generate template zip", error)
    return c.json({ message: "Failed to generate starter project" }, 500)
  }
}

app.get("/compose-android", (c) => c.html(<TemplateFormPage templateName="compose-android" />))
app.post("/compose-android", (c) => templateZipGenerator(c, "compose-android"))

app.notFound((c) => c.json({ message: "Not found" }, 404))

const msg = `🔥 Hono server started at ${blue("http://localhost:8000")}`
Deno.serve({ onListen: () => console.log(msg) }, app.fetch)
