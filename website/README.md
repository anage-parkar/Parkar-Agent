# Parkar Main Website

**Live URL:** https://www.parkar.in  
**Hosting:** Cloudflare Pages (auto-deploys from GitHub)  
**Stack:** Static HTML / CSS / JavaScript

---

## Before You Push — Read This First

### Sitemap Generation (Required before every deployment)

Whenever you add, remove, or rename any HTML page, you **must** regenerate the sitemap before pushing.

Run this command from the project root:

```bash
node generate-sitemap.js
```

This will:
- Scan all HTML files in the project
- Generate a fresh `sitemap.xml` with all valid page URLs
- Update `robots.txt` if the sitemap line is missing
- Print a summary of all pages included and any pages skipped

**Then commit and push:**

```bash
git add .
git commit -m "your commit message"
git push
```