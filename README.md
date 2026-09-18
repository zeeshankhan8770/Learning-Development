# Zeesh Portfolio — Node/Express Edition

This is your original static portfolio template, restructured as a Node/Express
app. The `contact.php` + PHPMailer handler has been replaced with a Node route
powered by **Nodemailer** — same behavior, no PHP required.

## What changed from the original zip

- All static files (HTML/CSS/JS/webfonts) moved into `public/`, served by Express.
- `index-light.html` is also copied to `public/index.html` so `/` loads a page by default. All 8 theme variants are still served at their original filenames (e.g. `/index-dark.html`).
- `contact.php` and the bundled `PHPMailer` library were **removed** — replaced by `src/services/mailer.service.js` (Nodemailer) and `src/controllers/contact.controller.js`.
- `public/js/app.js` was updated in one place: the contact form now `fetch()`s `/api/contact` (JSON) instead of `contact.php` (FormData). No other frontend behavior changed.
- Added a basic rate limiter (5 submissions / 15 min per IP) on the contact endpoint.

## ⚠️ Security note on the original file

The `contact.php` you uploaded had a **real-looking Gmail app password hardcoded
in plain text** (`SMTP_PASS`). That value was **not** carried into this project —
`.env.example` only has placeholders. If that password is real, treat it as
compromised: revoke it at https://myaccount.google.com/apppasswords and
generate a new one for this project. Never commit real credentials to a repo —
`.env` is gitignored here for that reason.

## Project structure

```
zeesh-portfolio-node/
├── public/              # everything served as static files
│   ├── index.html       # default landing page (copy of index-light.html)
│   ├── index-*.html     # the other 7 theme variants
│   ├── css/
│   ├── js/               (app.js, typewriter.js)
│   ├── webfonts/
│   └── img/
│       ├── clients/     # empty — add your client logos here
│       └── projects/    # empty — add your project screenshots here
├── src/
│   ├── server.js        # starts the server
│   ├── app.js            # express app: middleware, static files, routes
│   ├── routes/
│   │   └── contact.routes.js
│   ├── controllers/
│   │   └── contact.controller.js   # validates input, calls the mailer
│   ├── services/
│   │   └── mailer.service.js       # Nodemailer SMTP logic
│   ├── middlewares/
│   │   └── errorHandler.js
│   └── config/
│       └── env.js        # reads/centralizes .env values
├── .env.example
├── .gitignore
└── package.json
```

## Setup

```bash
npm install
cp .env.example .env   # then fill in real values
npm run dev             # http://localhost:3000
```

### `.env` values

| Variable | Meaning |
|---|---|
| `PORT` | Local server port |
| `RECIPIENT_EMAIL` | Where contact-form messages get delivered |
| `SENDER_NAME` | Display name on the outgoing email |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | Your mail provider's SMTP settings |
| `SMTP_USER` / `SMTP_PASS` | The mailbox sending the email (for Gmail, use an **App Password**, not your normal password) |

## Adding your images

Drop files into `public/img/projects/` and `public/img/clients/`, then reference
them from the HTML/JS where the template currently points at `placehold.co`
placeholder images.

## Notes

- No database or templating engine is used — the HTML pages are served as-is via `express.static`, since the original template isn't dynamic per-page.
- If you deploy this, most hosts (Render, Railway, Fly.io, a VPS, etc.) work fine since it's just a standard Express app — just set the same env vars there.
