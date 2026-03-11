const TOKEN_PATTERN = /[\s_-]+/g

const splitWords = (input: string): string[] => {
  const withSpacing = input
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(TOKEN_PATTERN, " ")
    .trim()

  if (!withSpacing) return []

  return withSpacing
    .split(/\s+/)
    .map((word) => word.toLowerCase())
    .filter(Boolean)
}

const toCamelCase = (words: string[]): string => {
  if (words.length === 0) return ""
  const [first, ...rest] = words
  return first + rest.map((word) => word[0].toUpperCase() + word.slice(1)).join("")
}

const toPascalCase = (words: string[]): string =>
  words.map((word) => word[0].toUpperCase() + word.slice(1)).join("")

const toSnakeCase = (words: string[]): string => words.join("_")

const toKebabCase = (words: string[]): string => words.join("-")

const toPackageCase = (words: string[]): string => words.join("")

export const buildProjectNamePlaceholders = (projectName: string): Record<string, string> => {
  const words = splitWords(projectName)
  return {
    "{{PROJECT_NAME}}": projectName,
    "{{PROJECT_NAME_LOWER}}": projectName.toLowerCase(),
    "{{PROJECT_NAME_PACKAGECASE}}": toPackageCase(words),
    "{{PROJECT_NAME_CAMELCASE}}": toCamelCase(words),
    "{{PROJECT_NAME_PASCALCASE}}": toPascalCase(words),
    "{{PROJECT_NAME_SNAKECASE}}": toSnakeCase(words),
    "{{PROJECT_NAME_KEBABCASE}}": toKebabCase(words),
  }
}

export const replacePlaceholders = (input: string, placeholders: Record<string, string>): string =>
  Object.entries(placeholders).reduce((acc, [token, value]) => acc.split(token).join(value), input)
