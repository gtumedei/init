const PROJECT_NAME_PATTERN = /^[A-Za-z0-9_-]+$/

export const isValidProjectName = (value: string): boolean => {
  const trimmed = value.trim()
  return trimmed.length > 0 && PROJECT_NAME_PATTERN.test(trimmed)
}

export const normalizeProjectName = (value: string): string => value.trim()

export const getValidatedProjectName = (value: string): string => {
  const normalized = normalizeProjectName(value)
  if (!isValidProjectName(normalized))
    throw new Error("Project name must contain only letters, numbers, hyphens, or underscores.")
  return normalized
}
