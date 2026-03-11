/** @jsxImportSource hono/jsx */

import { FC } from "hono/jsx"

const css = (s: TemplateStringsArray) => s

export const TemplateFormPage: FC<{ templateName: string }> = ({ templateName }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>{templateName} starter generator</title>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />

        <style>{css`
          html {
            box-sizing: border-box;
            font-size: 16px;
            min-height: 100%;
            display: flex;
          }

          *,
          *:before,
          *:after {
            box-sizing: inherit;
            margin: 0;
            font-family: Outfit, sans-serif;
          }

          body {
            background: #f3f4f6;
            color: #111827;
            flex-grow: 1;
            display: flex;
          }

          main {
            flex-grow: 1;
            display: grid;
            place-items: center;
            padding: 1.5rem;
          }

          .card {
            width: min(560px, 100%);
            background: white;
            display: flex;
            flex-direction: column;
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
          }

          .title {
            font-weight: 700;
            margin-bottom: 0.25rem;
          }

          .subtitle {
            color: #525252;
            margin-bottom: 1.5rem;
          }

          .form {
            display: grid;
            gap: 1.5rem;
          }

          .form-field {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .label {
            font-weight: 500;
          }

          .text-input {
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 0.75rem;
            font-size: 1rem;
          }

          .hint {
            color: #737373;
          }

          .btn {
            border: 0;
            border-radius: 8px;
            padding: 0.75rem 1rem;
            background: #a855f7;
            color: #fff;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
          }
        `}</style>
      </head>
      <body>
        <main>
          <section class="card">
            <h1 class="title">{templateName}</h1>
            <p class="subtitle">Generate a project from this template.</p>
            <form class="form" method="post" action={`/${templateName}`}>
              <div class="form-field">
                <label for="projectName" class="label">
                  Project name
                </label>
                <input id="projectName" name="projectName" class="text-input" required />
                <small class="hint">
                  Allowed characters: letters, numbers, hyphens, underscores.
                </small>
              </div>
              <button type="submit" class="btn">
                Download project zip
              </button>
            </form>
          </section>
        </main>
      </body>
    </html>
  )
}
