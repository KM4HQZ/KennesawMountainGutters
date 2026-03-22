# Kennesaw Mountain Gutters

Marketing website and Cloudflare Pages deployment for a gutter cleaning service based in Kennesaw, Georgia.

## Overview

This repository contains a small static site with a Cloudflare Pages Function for quote form submissions.

Current deployment model:

1. Source of truth is this GitHub repository.
2. Cloudflare Pages is connected to the repository.
3. Pushes to `main` trigger production deployments.
4. The live site is served from:
   - `https://kennesawmountaingutters.com`
   - `https://www.kennesawmountaingutters.com`

## Project structure

- `index.html`: main site markup
- `styles.css`: site styling
- `script.js`: navigation, reveal animation, and quote form submission behavior
- `functions/api/quote.js`: Cloudflare Pages Function that handles quote requests
- `robots.txt`: crawler rules
- `sitemap.xml`: sitemap for search engines
- `package.json`: local Wrangler scripts for preview and direct deploys

## Local development

Install dependencies:

```bash
npm install
```

Run a local Pages preview:

```bash
npm run dev
```

This uses Wrangler to serve the static files and the Pages Function locally.

## Deployment

Cloudflare Pages is already configured to deploy this repository from GitHub.

Production settings:

1. Project: `kennesawmountaingutters-git`
2. Repository: `KM4HQZ/KennesawMountainGutters`
3. Production branch: `main`
4. Framework preset: `None`
5. Build command: blank
6. Build output directory: `.`
7. Root directory: blank

Normal deployment flow:

1. Edit files locally.
2. Commit changes.
3. Push to `main`.
4. Cloudflare Pages deploys automatically.

Optional direct deploy from a local machine with Wrangler:

```bash
npm run deploy
```

## Quote form

The quote form submits to `/api/quote` and is handled by the Pages Function in `functions/api/quote.js`.

The function requires these Cloudflare Pages secrets:

1. `RESEND_API_KEY`
2. `QUOTE_DESTINATION`
3. `FROM_EMAIL`

If those secrets are not configured, the site still loads, but quote submissions will not send email.

### Secret meanings

1. `RESEND_API_KEY`: API key for Resend
2. `QUOTE_DESTINATION`: inbox that should receive quote requests
3. `FROM_EMAIL`: verified sender address used by Resend

## Content updates

Edit these files for normal website changes:

1. `index.html` for text, sections, calls to action, and page structure
2. `styles.css` for colors, spacing, layout, and visual design
3. `script.js` for client-side behavior

## Operational notes

1. This repo does not store live API credentials.
2. Deployment secrets should stay in Cloudflare Pages, not in Git.
3. If ownership changes later, review both GitHub repository access and Cloudflare project/domain access.

## Handoff checklist

For a future maintainer or owner:

1. Confirm GitHub access to this repository.
2. Confirm Cloudflare access to the `kennesawmountaingutters-git` Pages project.
3. Confirm access to the domain DNS zone.
4. Confirm access to the email provider and form secrets.
5. Test a deployment by pushing a small content change.

## License

No license has been added to this repository yet.