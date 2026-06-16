/** @jsxImportSource hono/jsx */

import { Hono } from "hono"
import { stream } from "hono/streaming"
import { z } from "zod"
import Root from "~/lib/components/root.tsx"
import { buildGeneratedTemplateZip } from "~/lib/zip-processor.ts"

type Template = {
  slug: string
  title: string
  description: string
}

export const templateRoutes = (template: Template) =>
  new Hono()
    .get("/", (c) => {
      const err = c.req.query("e")

      return c.html(
        <Root title={template.title}>
          <main class="grow grid place-items-center p-6">
            <section class="container max-w-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 flex flex-col p-6 rounded-2xl shadow-lg">
              <h1 class="text-2xl font-bold mb-1">{template.title}</h1>
              <p class="text-sm text-gray-600 dark:text-neutral-300 mb-6">{template.description}</p>
              <h2 class="text-lg font-semibold mb-3">Generate a project from this template</h2>
              <form class="grid gap-4" method="post" action={`/${template.slug}`}>
                <div class="flex flex-col gap-1">
                  <label for="projectName" class="font-medium">
                    Project name
                  </label>
                  <input
                    id="projectName"
                    name="projectName"
                    class="bg-transparent rounded-lg border border-gray-200 dark:border-neutral-700 shadow-xs focus-visible:border-zinc-500 focus-visible:ring-2 ring-zinc-500/40"
                    required
                  />
                  <p class="text-sm text-gray-500 dark:text-neutral-400">
                    Allowed characters: letters, numbers, hyphens, underscores.
                  </p>
                  {err && <p class="text-sm text-rose-400">{err}</p>}
                </div>
                <button
                  type="submit"
                  class="h-10.5 text-sm font-medium bg-zinc-700 text-white px-3 rounded-lg shadow-xs focus-visible:ring-2 ring-zinc-500/40 outline-none! cursor-pointer"
                >
                  Download project zip
                </button>
              </form>
            </section>
          </main>
          <footer class="grid place-items-center text-center mt-auto px-6 pb-6">
            <a
              href="https://github.com/gtumedei/init"
              target="_blank"
              class="text-sm text-gray-500 dark:text-neutral-400 hover:text-zinc-500 hover:underline"
            >
              Source code
            </a>
          </footer>
        </Root>,
      )
    })

    .post("/", async (c) => {
      const error = (message: string) => {
        console.error(message)
        return c.redirect(`/${template.slug}?e=${encodeURIComponent(message)}`)
      }

      const ProjectNameSchema = z
        .string()
        .trim()
        .regex(/^[A-Za-z0-9_-]+$/)
      const formData = await c.req.formData()
      const res = ProjectNameSchema.safeParse(formData.get("projectName"))
      if (!res.success) return error(z.prettifyError(res.error))
      const projectName = res.data

      try {
        const templateUrl = new URL(
          `/templates/${encodeURIComponent(template.slug)}.zip`,
          c.req.url,
        )
        const templateResponse = await fetch(templateUrl, { signal: AbortSignal.timeout(8000) })

        if (templateResponse.status == 404) return error("Template not found")
        if (!templateResponse.ok)
          return error(
            `Failed to fetch template "${template.slug}" (HTTP ${templateResponse.status})`,
          )

        const templateZip = new Uint8Array(await templateResponse.arrayBuffer())
        const generatedZip = await buildGeneratedTemplateZip(templateZip, projectName)

        c.header("Content-Type", "application/zip")
        c.header("Content-Disposition", `attachment; filename="${projectName}.zip"`)
        c.header("Cache-Control", "no-store")
        return stream(c, async (s) => {
          await s.write(generatedZip)
        })
      } catch (err) {
        return error(
          err instanceof DOMException && err.name === "TimeoutError"
            ? "Template source timed out"
            : `Failed to generate template zip: ${err instanceof Error ? err.message : "Unknown error"}`,
        )
      }
    })
