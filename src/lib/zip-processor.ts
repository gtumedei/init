import JSZip from "jszip"
import { buildProjectNamePlaceholders, replacePlaceholders } from "~/lib/casing.ts"

const looksLikeTextContent = (bytes: Uint8Array): boolean => {
  if (bytes.length === 0) return true

  const sampleSize = Math.min(bytes.length, 4096)
  for (let i = 0; i < sampleSize; i += 1) {
    if (bytes[i] === 0) return false
  }

  try {
    const sampleText = new TextDecoder("utf-8", { fatal: true }).decode(
      bytes.subarray(0, sampleSize),
    )
    let suspiciousControlCount = 0
    for (const char of sampleText) {
      const code = char.charCodeAt(0)
      const isControl =
        (code >= 0x00 && code <= 0x08) ||
        code === 0x0b ||
        code === 0x0c ||
        (code >= 0x0e && code <= 0x1f) ||
        code === 0x7f
      if (isControl) suspiciousControlCount += 1
    }
    const suspiciousRatio = suspiciousControlCount / sampleText.length
    return suspiciousRatio < 0.05
  } catch {
    return false
  }
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

    if (!looksLikeTextContent(fileBytes)) {
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
