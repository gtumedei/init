/** @jsxImportSource hono/jsx */

import { PropsWithChildren } from "hono/jsx"

const Root = ({ title, children }: PropsWithChildren<{ title: string }>) => {
  return (
    <html
      lang="en"
      class="min-h-full flex bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white"
    >
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>{title} • init</title>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <link href="/global.css" rel="stylesheet" />
      </head>
      <body class="grow flex flex-col">{children}</body>
    </html>
  )
}

export default Root
