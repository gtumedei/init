function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

export function renderTemplateForm(templateName: string): string {
  const escapedTemplateName = escapeHtml(templateName)

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapedTemplateName} starter generator</title>
    <style>
      :root {
        color-scheme: light;
      }

      body {
        margin: 0;
        font-family: sans-serif;
        background: #f3f4f6;
        color: #111827;
      }

      main {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 1.5rem;
      }

      section {
        width: min(560px, 100%);
        background: white;
        border-radius: 10px;
        padding: 1.5rem;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
      }

      h1 {
        margin-top: 0;
      }

      form {
        display: grid;
        gap: 1rem;
      }

      input {
        border: 1px solid #d1d5db;
        border-radius: 8px;
        padding: 0.75rem;
        font-size: 1rem;
      }

      button {
        border: 0;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        background: #111827;
        color: #fff;
        font-size: 1rem;
        cursor: pointer;
      }

      small {
        color: #4b5563;
      }
    </style>
  </head>
  <body>
    <main>
      <section>
        <h1>${escapedTemplateName}</h1>
        <p>Generate a customized starter zip file.</p>
        <form method="post" action="/${escapedTemplateName}">
          <label for="projectName">Project name</label>
          <input id="projectName" name="projectName" required pattern="[A-Za-z0-9_-]+" />
          <small>Allowed characters: letters, numbers, hyphens, underscores.</small>
          <button type="submit">Download starter zip</button>
        </form>
      </section>
    </main>
  </body>
</html>`
}
