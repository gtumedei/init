import JSZip from "jszip"
import { buildProjectNamePlaceholders, replacePlaceholders } from "~/lib/casing.ts"

const TEXT_EXTENSIONS = new Set([
  "txt",
  "md",
  "json",
  "jsonc",
  "yaml",
  "yml",
  "toml",
  "xml",
  "html",
  "css",
  "scss",
  "sass",
  "js",
  "jsx",
  "ts",
  "tsx",
  "java",
  "kt",
  "kts",
  "gradle",
  "properties",
  "gitignore",
  "env",
  "sh",
  "sql",
  "csv",
  "go",
  "rs",
  "py",
  "rb",
  "php",
  "swift",
  "c",
  "h",
  "cpp",
  "hpp",
])

const getFileExtension = (path: string): string => {
  const fileName = path.split("/").pop() ?? ""
  const lastDot = fileName.lastIndexOf(".")
  if (lastDot === -1) return fileName.toLowerCase()
  return fileName.slice(lastDot + 1).toLowerCase()
}

const looksLikeTextContent = (bytes: Uint8Array): boolean => {
  const sampleSize = Math.min(bytes.length, 2048)
  for (let i = 0; i < sampleSize; i += 1) {
    if (bytes[i] === 0) return false
  }
  return true
}

const shouldTreatAsText = (path: string, bytes: Uint8Array): boolean => {
  const extension = getFileExtension(path)
  if (TEXT_EXTENSIONS.has(extension)) return true
  return looksLikeTextContent(bytes)
}

export const buildGeneratedTemplateZip = async (
  templateZipBytes: Uint8Array,
  projectName: string,
): Promise<Uint8Array> => {
  const placeholders = buildProjectNamePlaceholders(projectName)
  const sourceZip = await JSZip.loadAsync(templateZipBytes)
  const outputZip = new JSZip()

  const entries = Object.entries(sourceZip.files)

  for (const [entryName, entry] of entries) {
    const replacedEntryName = replacePlaceholders(entryName, placeholders)

    if (entry.dir) {
      outputZip.folder(replacedEntryName)
      continue
    }

    const fileBytes = await entry.async("uint8array")

    if (!shouldTreatAsText(entryName, fileBytes)) {
      outputZip.file(replacedEntryName, fileBytes, {
        binary: true,
        date: entry.date,
        comment: entry.comment,
        unixPermissions: entry.unixPermissions,
        dosPermissions: entry.dosPermissions,
        createFolders: true,
      })
      continue
    }

    const decodedText = new TextDecoder().decode(fileBytes)
    const replacedText = replacePlaceholders(decodedText, placeholders)

    outputZip.file(replacedEntryName, replacedText, {
      binary: false,
      date: entry.date,
      comment: entry.comment,
      unixPermissions: entry.unixPermissions,
      dosPermissions: entry.dosPermissions,
      createFolders: true,
    })
  }

  return outputZip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  })
}
