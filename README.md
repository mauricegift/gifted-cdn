<div align="center">

<img src="https://telegra.ph/file/c2a4d8d65722553da4c89.jpg" alt="Gifted CDN Logo" width="120" style="border-radius:50%"/>

# 🎁 Gifted CDN

**A blazing-fast, self-hosted file CDN built on Cloudflare R2 + MongoDB + Express.**

Upload images, videos, audio and documents through a friendly web UI or a clean public API — get a permanent CDN link back in milliseconds.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cdn.giftedtech.co.ke-brightgreen?style=for-the-badge)](https://cdn.giftedtech.co.ke)
[![Version](https://img.shields.io/badge/version-1.2.6-blue?style=for-the-badge)](./package.json)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Cloudflare R2](https://img.shields.io/badge/Storage-Cloudflare%20R2-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://www.cloudflare.com/products/r2/)
[![License](https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge)](#-license)

[Live Demo](https://cdn.giftedtech.co.ke) • [API Docs](https://cdn.giftedtech.co.ke/docs) • [Report Bug](https://github.com/mauricegift/gifted-cdn/issues) • [Contact](https://cdn.giftedtech.co.ke/contact)

</div>

---

## 📑 Table of Contents

1. [What is Gifted CDN?](#-what-is-gifted-cdn)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [How It Works](#-how-it-works)
5. [Demo](#-demo)
6. [Prerequisites](#-prerequisites)
7. [Step-by-Step Setup (Total Beginner Friendly)](#-step-by-step-setup-total-beginner-friendly)
   - [1️⃣ Clone the Repository](#1️⃣-clone-the-repository)
   - [2️⃣ Install Dependencies](#2️⃣-install-dependencies)
   - [3️⃣ Create a Cloudflare R2 Bucket](#3️⃣-create-a-cloudflare-r2-bucket)
   - [4️⃣ Set Up MongoDB (free Atlas cluster)](#4️⃣-set-up-mongodb-free-atlas-cluster)
   - [5️⃣ Set Up Cloudflare Turnstile (CAPTCHA)](#5️⃣-set-up-cloudflare-turnstile-captcha)
   - [6️⃣ Create a Telegram Bot for the Contact Form](#6️⃣-create-a-telegram-bot-for-the-contact-form)
   - [7️⃣ Create the `.env` File](#7️⃣-create-the-env-file)
8. [Running the App](#-running-the-app)
9. [Deploying to Production (PM2)](#-deploying-to-production-pm2)
10. [API Reference](#-api-reference)
11. [Web Interface](#-web-interface)
12. [Project Structure](#-project-structure)
13. [Environment Variables Reference](#-environment-variables-reference)
14. [Rate Limits & Security](#-rate-limits--security)
15. [Troubleshooting / FAQ](#-troubleshooting--faq)
16. [Roadmap](#-roadmap)
17. [Contributing](#-contributing)
18. [License](#-license)
19. [Author & Contact](#-author--contact)

---

## 🎯 What is Gifted CDN?

**Gifted CDN** is a lightweight, open-source file management service that lets you (or your users) upload files and instantly get back a permanent, publicly-accessible CDN URL.

Behind the scenes it stores files on **Cloudflare R2** (S3-compatible object storage with **zero egress fees**) and tracks file metadata in **MongoDB**. It ships with:

- A polished web upload UI (drag-and-drop, progress bar, copy-link, animated)
- A clean JSON REST API for programmatic uploads / deletes
- A built-in contact form that delivers messages straight to your Telegram
- A full HTML API documentation page at `/docs`

It's perfect for:
- 📷 Hosting media for your blog, app, or bot
- 🎬 Sharing videos/audio without YouTube limits
- 📦 Acting as a dropbox-style file share for clients
- 🤖 Powering uploads from chatbots, scrapers, or scripts

---

## ✨ Features

| Category | Capabilities |
| --- | --- |
| **Storage** | Cloudflare R2 (S3 SDK), public-read URLs via custom domain, automatic folder routing (`image/`, `video/`, `audio/`, `file/`) |
| **Uploads** | Drag-and-drop UI, REST API, `multer` memory-buffer pipeline, 100 MB max per file |
| **File Types** | Images, videos, audio, documents — 100+ MIME types whitelisted out of the box |
| **Security** | Cloudflare Turnstile CAPTCHA on the UI, Helmet headers, CORS, rate-limiting, optional `deleteKey` for safe deletion |
| **Database** | MongoDB stores metadata, original name, R2 path, mimetype, size, timestamps |
| **Logging** | Winston JSON logs to `logs/combined.log` and `logs/error.log` |
| **Deployment** | First-class PM2 support (start, stop, reload, save, startup, monit) |
| **Docs UI** | Built-in `/docs` page with copy-paste examples in cURL, JavaScript and Python |
| **Contact** | Built-in `/contact` form delivers submissions (and attachments) to a Telegram chat |
| **Mobile** | Fully responsive Tailwind UI |

---

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | **Node.js 18+** |
| Framework | **Express.js** |
| Storage | **Cloudflare R2** (via `@aws-sdk/client-s3`) |
| Database | **MongoDB** (via `mongoose`) |
| Uploads | **multer** (memory storage) |
| CAPTCHA | **Cloudflare Turnstile** |
| Notifications | **Telegram Bot API** (for contact form) |
| Security | **Helmet**, **CORS**, **express-rate-limit** |
| Logging | **Winston** |
| Process Manager | **PM2** |
| Frontend | Vanilla HTML + **Tailwind CSS** + **particles.js** |

---

## ⚙ How It Works

```
                        ┌─────────────────────────────┐
                        │         Browser /           │
                        │      External Client        │
                        └──────────────┬──────────────┘
                                       │ HTTPS upload
                                       ▼
        ┌─────────────────────────────────────────────────────┐
        │                Express API (Node.js)                │
        │  • Turnstile CAPTCHA check (UI only)                │
        │  • MIME-type whitelist + 100 MB cap                 │
        │  • Generates short random prefix: e.g. "Xy3"        │
        │  • Routes file into folder by type (image/video…)   │
        └────────────┬───────────────────────────┬────────────┘
                     │                           │
       writes file   │                           │  saves metadata
                     ▼                           ▼
       ┌──────────────────────────┐   ┌──────────────────────────┐
       │   Cloudflare R2 Bucket   │   │    MongoDB collection    │
       │   (public-read object)   │   │    name, path, url,      │
       │                          │   │    mimetype, deleteKey…  │
       └────────────┬─────────────┘   └──────────────────────────┘
                    │
                    ▼
       ┌──────────────────────────┐
       │  Custom domain CDN URL   │
       │  https://files.your.com  │
       │  /image/Xy3-photo.jpg    │
       └──────────────────────────┘
```

---

## 🚀 Demo

| Page | URL |
| --- | --- |
| Upload UI | <https://cdn.giftedtech.co.ke> |
| API Docs | <https://cdn.giftedtech.co.ke/docs> |
| Contact | <https://cdn.giftedtech.co.ke/contact> |
| Delete UI | <https://cdn.giftedtech.co.ke/delete> |

---

## 📋 Prerequisites

Before you start, make sure you have:

- ✅ **Node.js 18 or newer** — [download here](https://nodejs.org/)
- ✅ **npm** (comes with Node.js) or **yarn**
- ✅ **Git** — [download here](https://git-scm.com/downloads)
- ✅ A free **Cloudflare account** — [signup](https://dash.cloudflare.com/sign-up)
- ✅ A free **MongoDB Atlas account** *(or a self-hosted MongoDB)* — [signup](https://www.mongodb.com/cloud/atlas/register)
- ✅ A **Telegram account** *(only needed for the contact form)*
- ✅ Basic familiarity with the terminal/command line

---

## 🧰 Step-by-Step Setup (Total Beginner Friendly)

> 💡 **New to all this?** Just follow each step in order. Don't skip — every variable matters.

### 1️⃣ Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/mauricegift/gifted-cdn.git
cd gifted-cdn
```

### 2️⃣ Install Dependencies

```bash
npm install
```

This installs every package listed in `package.json` (Express, MongoDB driver, AWS S3 SDK, etc.).

### 3️⃣ Create a Cloudflare R2 Bucket

Cloudflare R2 is where your actual files will live. It's S3-compatible and **free for up to 10 GB** with no egress fees.

1. Sign in to your **Cloudflare Dashboard** → in the left sidebar click **R2 Object Storage**.
2. Click **Create bucket**.
   - **Bucket name:** anything you like, e.g. `files`
   - **Location:** *Automatic* (or pick the region closest to your users)
   - Click **Create bucket**.
3. Open the bucket → go to the **Settings** tab.
4. Scroll to **Public access** → click **Connect Domain** and choose either:
   - A subdomain you own (e.g. `files.yourdomain.com`) — recommended; OR
   - The free `r2.dev` URL Cloudflare gives you.
5. Note the **Public Access URL** (we'll use this as `CF_BUCKET_DOMAIN`).
6. Now go back to **R2 Overview** → click **Manage R2 API Tokens** (top-right) → **Create API token**.
   - **Permissions:** *Object Read & Write*
   - **Specify bucket:** select the bucket you just created
   - Click **Create API Token**
7. Copy and save:
   - **Access Key ID** → `CF_ACCESS_KEY_ID`
   - **Secret Access Key** → `CF_SECRET_ACCESS_KEY`
   - **Endpoint URL** (looks like `https://<account-id>.r2.cloudflarestorage.com`) → `CF_BUCKET_API_ENDPOINT`

> ⚠️ The Secret Access Key is shown **only once**. Save it somewhere safe immediately.

### 4️⃣ Set Up MongoDB (free Atlas cluster)

MongoDB stores file metadata (name, R2 path, delete key, etc.).

1. Sign in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Click **Build a Database** → choose the free **M0** tier → pick a cloud provider/region close to you → **Create**.
3. **Create a database user**: pick a username + a strong password. Save these.
4. **Network Access** → **Add IP Address** → click **Allow Access from Anywhere** (`0.0.0.0/0`) for development.
5. Go back to **Database** → click **Connect** on your cluster → choose **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<user>` and `<password>` with the credentials you just made.
7. Add a database name (e.g. `gifted_cdn`) before the `?`:
   ```
   mongodb+srv://yourUser:yourPass@cluster0.xxxxx.mongodb.net/gifted_cdn?retryWrites=true&w=majority
   ```
8. This full string is your `MONGO_URI`.

### 5️⃣ Set Up Cloudflare Turnstile (CAPTCHA)

Turnstile protects the public upload page from bots. It's free.

1. In the Cloudflare Dashboard → left sidebar → **Turnstile** → **Add Site**.
2. **Site name:** `gifted-cdn`
3. **Domains:** add your domain (e.g. `cdn.yourdomain.com`) AND `localhost` for local testing.
4. **Widget mode:** *Managed* (recommended).
5. Click **Create**.
6. Copy:
   - **Site Key** → paste it into `public/index.html` where it says `data-sitekey="..."` (search for `cf-turnstile`).
   - **Secret Key** → save as `CF_TURNSTILE_SECRET_KEY` in your `.env`.

### 6️⃣ Create a Telegram Bot for the Contact Form

> 💡 Only needed if you want contact-form submissions delivered to Telegram. Skip if you don't care.

1. Open Telegram → search **@BotFather** → start a chat → send `/newbot`.
2. Follow the prompts (name + username). BotFather replies with a token — save it as `BOT_TOKEN`.
3. **Get your Chat ID:**
   - Send any message to your new bot first.
   - Then visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` in a browser.
   - Find `"chat":{"id":123456789,...}` — that number is your `CHAT_ID`.
   - For a **group chat**, add the bot to the group, send `/start`, then call the same URL — the chat ID will be a negative number (e.g. `-100123456789`).

### 7️⃣ Create the `.env` File

In the project root create a file named `.env` and paste:

```env
# ─── Server ─────────────────────────────────────────────────
PORT=5000

# ─── Cloudflare R2 (Storage) ────────────────────────────────
CF_REGION=auto
CF_BUCKET_NAME=files
CF_BUCKET_DOMAIN=files.yourdomain.com
CF_BUCKET_API_ENDPOINT=https://<your-account-id>.r2.cloudflarestorage.com
CF_ACCESS_KEY_ID=your_r2_access_key_id
CF_SECRET_ACCESS_KEY=your_r2_secret_access_key

# ─── Cloudflare Turnstile (CAPTCHA) ─────────────────────────
CF_TURNSTILE_SECRET_KEY=your_turnstile_secret_key
CF_TURNSTILE_API_URL=https://challenges.cloudflare.com

# ─── MongoDB ────────────────────────────────────────────────
MONGO_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/gifted_cdn?retryWrites=true&w=majority

# ─── Telegram Contact Form ──────────────────────────────────
BOT_TOKEN=your_telegram_bot_token
CHAT_ID=your_telegram_chat_id
TELEGRAM_API_URL=https://api.telegram.org
```

> 🔒 **NEVER commit `.env` to git.** Make sure it's listed in `.gitignore`.

---

## ▶ Running the App

### Development (auto-restart on file changes)

```bash
npm run dev
```

### Production (single run)

```bash
npm start
```

Visit **<http://localhost:5000>** in your browser. You should see the Gifted CDN upload page. 🎉

---

## 🚢 Deploying to Production (PM2)

[PM2](https://pm2.keymetrics.io/) keeps your app running 24/7 and restarts it automatically if it crashes.

### Install PM2 globally (one-time)

```bash
npm run pm2:install
# or directly: npm install pm2 -g
```

### Common PM2 Commands

| Action | Command |
| --- | --- |
| Start in production mode | `npm run pm2:start:prod` |
| Start (default) | `npm run pm2:start` |
| Stop | `npm run pm2:stop` |
| Restart | `npm run pm2:restart` |
| Reload (zero-downtime) | `npm run pm2:reload` |
| Delete process | `npm run pm2:delete` |
| View live logs | `npm run pm2:logs` |
| Status dashboard | `npm run pm2:status` |
| Live monitor | `npm run pm2:monit` |
| Save current process list | `npm run pm2:save` |
| Auto-start on boot | `npm run pm2:startup` |

### Recommended Production Flow

```bash
npm run pm2:start:prod
npm run pm2:save
npm run pm2:startup        # follow the printed command to enable boot startup
```

### Front it with NGINX (optional but recommended)

Add a reverse proxy + HTTPS:

```nginx
server {
  listen 80;
  server_name cdn.yourdomain.com;

  client_max_body_size 110M;   # match the 100 MB upload cap

  location / {
    proxy_pass         http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header   Host              $host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
  }
}
```

Then issue a free SSL cert with Certbot:

```bash
sudo certbot --nginx -d cdn.yourdomain.com
```

---

## 📡 API Reference

> Base URL (your deployment): `https://cdn.yourdomain.com`
> Live demo base URL: `https://cdn.giftedtech.co.ke`

### 🔼 Upload a File — `POST /api/upload.php`

Public endpoint — no CAPTCHA. Use it from scripts, bots, mobile apps.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `file` | multipart/form-data | ✅ | The file to upload (max 100 MB) |
| `deleteKey` | string | ❌ | Optional. If set, you'll later need this same key to delete the file |

**Rate limit:** 10 uploads per IP per 5 minutes.

#### cURL example

```bash
curl -X POST https://cdn.giftedtech.co.ke/api/upload.php \
  -F "file=@/path/to/photo.jpg" \
  -F "deleteKey=my-secret-key-123"
```

#### JavaScript (browser / Node 18+)

```js
const form = new FormData();
form.append('file', fileInput.files[0]);
form.append('deleteKey', 'my-secret-key-123'); // optional

const res = await fetch('https://cdn.giftedtech.co.ke/api/upload.php', {
  method: 'POST',
  body: form
});
const data = await res.json();
console.log(data.url); // ← your CDN link
```

#### Python (requests)

```python
import requests

with open('photo.jpg', 'rb') as f:
    r = requests.post(
        'https://cdn.giftedtech.co.ke/api/upload.php',
        files={'file': f},
        data={'deleteKey': 'my-secret-key-123'},  # optional
    )
print(r.json()['url'])
```

#### Successful response (`200`)

```json
{
  "size": "546.03 kB",
  "mimetype": "image/jpeg",
  "storageClass": "Standard",
  "expiry": "No Expiry Unless Deleted",
  "name": "Xy3-photo.jpg",
  "path": "image/Xy3-photo.jpg",
  "modified": "May 17, 2025 1:49 PM",
  "url": "https://files.giftedtech.co.ke/image/Xy3-photo.jpg",
  "_id": "664a0b2f9c6e4e4f0c1a2b3c",
  "createdAt": "2025-05-17T10:49:00.000Z",
  "deleteKey": "my-secret-key-123"
}
```

### 🔽 Delete a File — `DELETE /api/delete.php`

Removes the file from R2 **and** the database. Requires the same `deleteKey` used at upload.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `fileName` | string | ✅ | Exact `name` returned at upload (e.g. `Xy3-photo.jpg`) |
| `deleteKey` | string | ✅ | The delete key originally used |

#### cURL example

```bash
curl -X DELETE https://cdn.giftedtech.co.ke/api/delete.php \
  -H "Content-Type: application/json" \
  -d '{"fileName":"Xy3-photo.jpg","deleteKey":"my-secret-key-123"}'
```

#### JavaScript

```js
const res = await fetch('https://cdn.giftedtech.co.ke/api/delete.php', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileName: 'Xy3-photo.jpg',
    deleteKey: 'my-secret-key-123'
  })
});
console.log(await res.json());
```

#### Successful response

```json
{
  "name": "Xy3-photo.jpg",
  "path": "image/Xy3-photo.jpg",
  "deleted": true,
  "deletedAt": "May 17, 2025 2:10 PM",
  "_id": "664a0b2f9c6e4e4f0c1a2b3c",
  "deletedFromDb": true,
  "deletedFromServer": true
}
```

#### Common errors

| Status | Reason |
| --- | --- |
| `400` | `fileName` missing |
| `403` | No delete key was set on upload, **or** key doesn't match |
| `404` | File not found in DB |

### 📥 Fetch File Info — `GET /file/:filename`

Returns the metadata for an existing file (path = `image/Xy3-photo.jpg`, etc.).

```bash
curl https://cdn.giftedtech.co.ke/file/image%2FXy3-photo.jpg
```

### 📨 Contact Form — `POST /api/sendMessage.php`

Used internally by the `/contact` page to forward messages (and optional attachments) to your Telegram chat.

| Field | Required | Description |
| --- | --- | --- |
| `name` | ✅ | Sender's name |
| `email` | ✅ | Sender's email |
| `phone` | ❌ | Phone |
| `message` | ✅ | Message body |
| `file` | ❌ | Optional file attachment |

### 🌐 Web-Only Endpoint — `POST /giftedUpload.php`

Same as `/api/upload.php` but **requires** a valid Cloudflare Turnstile token in the `Turnstile-Token` header. Used by the built-in upload UI.

---

## 🖥 Web Interface

| Route | What it does |
| --- | --- |
| `/` | Drag-and-drop upload UI (CAPTCHA-protected) |
| `/docs` | Pretty HTML API documentation |
| `/delete` | Self-service file deletion via delete key |
| `/contact` | Contact form (forwards to Telegram) |

All pages are responsive (mobile + desktop) and styled with Tailwind.

---

## 🗂 Project Structure

```
gifted-cdn/
├── api/
│   ├── client/
│   │   └── index.js          # Cloudflare R2 (S3 SDK) wrapper — upload/get/delete
│   ├── db/
│   │   └── index.js          # MongoDB connection (mongoose)
│   ├── models/
│   │   └── index.js          # File schema (name, path, url, mimetype, deleteKey…)
│   └── index.js              # Express app — routes, multer, rate-limit, Turnstile
│
├── public/
│   ├── index.html            # Upload UI (home page)
│   ├── docs/index.html       # API documentation page
│   ├── delete/index.html     # File deletion UI
│   └── contact/index.html    # Contact form
│
├── logs/                     # Winston logs (auto-created)
│   ├── combined.log
│   └── error.log
│
├── config.js                 # Reads env vars + sane defaults (incl. MIME whitelist)
├── package.json              # Dependencies + npm scripts (incl. PM2)
├── .env                      # Secrets (you create this — never commit)
└── README.md                 # ← this file
```

---

## 🔧 Environment Variables Reference

| Variable | Required | Default | Description |
| --- | :---: | --- | --- |
| `PORT` | ❌ | `5000` | Port the Express server listens on |
| `CF_REGION` | ❌ | `auto` | R2 region — leave as `auto` |
| `CF_BUCKET_NAME` | ✅ | `files` | Your Cloudflare R2 bucket name |
| `CF_BUCKET_DOMAIN` | ✅ | `files.giftedtech.co.ke` | Public domain bound to your R2 bucket (no `https://`) |
| `CF_BUCKET_API_ENDPOINT` | ✅ | — | R2 S3 endpoint (`https://<acct>.r2.cloudflarestorage.com`) |
| `CF_ACCESS_KEY_ID` | ✅ | — | R2 API access key id |
| `CF_SECRET_ACCESS_KEY` | ✅ | — | R2 API secret access key |
| `CF_TURNSTILE_SECRET_KEY` | ✅* | — | Turnstile secret (*needed only by `/giftedUpload.php`) |
| `CF_TURNSTILE_API_URL` | ❌ | `https://challenges.cloudflare.com` | Turnstile verification endpoint |
| `MONGO_URI` | ✅ | — | Full MongoDB connection string |
| `BOT_TOKEN` | ❌ | — | Telegram bot token (contact form) |
| `CHAT_ID` | ❌ | — | Telegram chat id (contact form recipient) |
| `TELEGRAM_API_URL` | ❌ | `https://api.telegram.org` | Telegram API base URL |
| `IMAGE_MIMETYPES` | ❌ | *built-in list* | Override the allowed image MIME types |
| `VIDEO_MIMETYPES` | ❌ | *built-in list* | Override the allowed video MIME types |
| `AUDIO_MIMETYPES` | ❌ | *built-in list* | Override the allowed audio MIME types |
| `DOC_MIMETYPES` | ❌ | *built-in list* | Override the allowed document MIME types |

---

## 🛡 Rate Limits & Security

- **Upload rate limit:** 10 uploads / 5 min / IP (configurable in `api/index.js`).
- **File size cap:** 100 MB (set in `multer` limits).
- **MIME whitelist:** uploads outside the configured image/video/audio/doc lists are rejected with `400`.
- **CAPTCHA:** the public web upload uses Cloudflare Turnstile so bots can't spam your bucket.
- **Delete protection:** files saved without a `deleteKey` cannot be deleted via the public API — you must delete them directly from your R2 dashboard.
- **CORS:** open by default (`*`). Lock this down in `api/index.js` if you only want certain origins to call your API.
- **Helmet & secure headers:** ready to enable — call `app.use(helmet())` in `api/index.js`.
- **Logs:** all errors and uploads logged to `logs/` via Winston.

---

## 🧯 Troubleshooting / FAQ

<details>
<summary><b>Database Connected ❌ / "DB connection error"</b></summary>

- Double-check `MONGO_URI` — it must include the username, password (URL-encoded if it contains `@`, `:`, `/`), and a database name.
- In MongoDB Atlas → **Network Access**, make sure your server's IP (or `0.0.0.0/0` for testing) is whitelisted.
</details>

<details>
<summary><b>Files upload but the URL returns 403 / Access Denied</b></summary>

- In R2 → bucket → **Settings** → **Public access**, confirm a public domain is connected.
- The code uploads with `ACL: 'public-read'` — that ACL is honoured only when the bucket has public access enabled.
- If you're using the `r2.dev` URL, it must be **enabled** under Public Access.
</details>

<details>
<summary><b>"CAPTCHA Response is Required"</b></summary>

- The web UI must include a valid Turnstile site key in `public/index.html` (`data-sitekey`).
- If you only use the API (`/api/upload.php`), you do **not** need Turnstile — that endpoint skips it.
</details>

<details>
<summary><b>Telegram contact form does nothing</b></summary>

- Verify the bot token by visiting `https://api.telegram.org/bot<TOKEN>/getMe` — it should return your bot info.
- Verify the chat ID by sending the bot a message first, then calling `/getUpdates`.
- For groups, the chat ID is **negative** (e.g. `-100123…`).
</details>

<details>
<summary><b>"File type not allowed"</b></summary>

- The MIME type isn't in any of the four whitelists. Either add it to the relevant `*_MIMETYPES` env variable in `.env`, or convert the file to a supported format.
</details>

<details>
<summary><b>I lost my deleteKey — how do I delete a file?</b></summary>

- You can't delete it via the API. Go to your R2 dashboard → bucket → find the file → delete manually. Then connect to MongoDB and delete the matching document from the `files` collection.
</details>

---

## 🗺 Roadmap

- [ ] User authentication (per-user file dashboards)
- [ ] Image transformations (resize, format convert) on the fly
- [ ] Configurable per-user storage quotas
- [ ] WebSocket upload progress for huge files
- [ ] Docker / Docker Compose support
- [ ] Optional virus scan via ClamAV before upload commits

---

## 🤝 Contributing

Contributions are welcome and appreciated! 💚

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/awesome-thing`
3. Commit your changes: `git commit -m 'Add awesome thing'`
4. Push to the branch: `git push origin feature/awesome-thing`
5. Open a Pull Request

Please run `npm run lint` and `npm run format` before submitting.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

```
MIT © 2024 - Present  Maurice Gift / GiftedTech
```

---

## 👤 Author & Contact

**Maurice Gift** — *Founder, GiftedTech*

- 🌐 Website: <https://me.giftedtech.co.ke>
- 🚀 Live CDN: <https://cdn.giftedtech.co.ke>
- 💼 GitHub: [@mauricegift](https://github.com/mauricegift)
- 📧 Email: [founder@giftedtech.co.ke](mailto:founder@giftedtech.co.ke)
- 💬 Need help? Use the [contact form](https://cdn.giftedtech.co.ke/contact)

---

<div align="center">

⭐ **If this project helped you, please give it a star!** ⭐

Made with ❤️ in Kenya 🇰🇪

</div>
