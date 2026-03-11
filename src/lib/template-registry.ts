import { join } from "@std/path"

const TEMPLATE_NAME_PATTERN = /^[A-Za-z0-9_-]+$/

export const getTemplateZipPath = (templateName: string): string =>
  join(Deno.cwd(), "public", "templates", `${templateName}.zip`)

export const templateExists = async (templateName: string): Promise<boolean> => {
  if (!TEMPLATE_NAME_PATTERN.test(templateName)) return false
  const templatePath = getTemplateZipPath(templateName)
  try {
    const stat = await Deno.stat(templatePath)
    return stat.isFile
  } catch {
    return false
  }
}
