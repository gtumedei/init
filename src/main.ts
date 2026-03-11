import { blue } from "@std/fmt/colors"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { serveStatic } from "hono/deno"
import { logger } from "hono/logger"
import { stream } from "hono/streaming"
import { getTemplateZipPath, templateExists } from "~/lib/template-registry.ts"
import { getValidatedProjectName } from "~/lib/validation.ts"
import { buildGeneratedTemplateZip } from "~/lib/zip-processor.ts"
import { renderTemplateForm } from "~/templates/template-form.ts"

const app = new Hono()

app.use(logger())
app.use(cors())

app.get("/", (c) => {
  return c.text("Hello Hono!")
})

app.use("/public/*", serveStatic({ root: "./" }))

app.get("/:template", async (c) => {
  const templateName = c.req.param("template")

  if (!(await templateExists(templateName))) {
    return c.json({ message: "Template not found" }, 404)
  }

  return c.html(renderTemplateForm(templateName))
})

app.post("/:template", async (c) => {
  const templateName = c.req.param("template")

  if (!(await templateExists(templateName))) {
    return c.json({ message: "Template not found" }, 404)
  }

  const formData = await c.req.formData()
  const rawProjectName = formData.get("projectName")

  if (typeof rawProjectName !== "string") {
    return c.json({ message: "Project name is required" }, 400)
  }

  let projectName: string

  try {
    projectName = getValidatedProjectName(rawProjectName)
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ message: error.message }, 400)
    }

    return c.json({ message: "Invalid project name" }, 400)
  }

  try {
    const templatePath = getTemplateZipPath(templateName)
    const templateZip = await Deno.readFile(templatePath)
    const generatedZip = await buildGeneratedTemplateZip(templateZip, projectName)

    c.header("Content-Type", "application/zip")
    c.header("Content-Disposition", `attachment; filename="${projectName}.zip"`)
    c.header("Cache-Control", "no-store")

    return stream(c, async (s) => {
      await s.write(generatedZip)
    })
  } catch (error) {
    console.error("Failed to generate template zip", error)
    return c.json({ message: "Failed to generate starter project" }, 500)
  }
})

app.notFound((c) => c.json({ message: "Not found" }, 404))

const msg = `🔥 Hono server started at ${blue("http://localhost:8000")}`
Deno.serve({ onListen: () => console.log(msg) }, app.fetch)
