# Gifted CDN - File Management Service

![Version](https://img.shields.io/badge/version-1.2.6-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A robust file management service built with Node.js and Express, utilizing Cloudflare R2 object storage via AWS S3-client SDK. This CDN provides secure file upload, storage, and deletion capabilities with optional delete key protection.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Usage Examples](#usage-examples)
- [Security Features](#security-features)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **File Upload**: Support for all file types (images, videos, audio, documents)
- **Cloudflare R2 Storage**: Leverages Cloudflare R2 for scalable object storage
- **Automatic File Organization**: Files are automatically organized into folders by type (image, video, audio, file)
- **Delete Key Protection**: Optional delete keys for secure file deletion
- **Rate Limiting**: Built-in rate limiting to prevent abuse (10 uploads per 5 minutes per IP)
- **Cloudflare Turnstile**: CAPTCHA verification for upload security
- **MongoDB Integration**: File metadata storage and tracking
- **Logging**: Winston-based logging for error tracking and monitoring
- **CORS Support**: Cross-origin resource sharing enabled
- **PM2 Support**: Production-ready process management
- **Responsive UI**: Modern, mobile-friendly web interface

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Storage**: Cloudflare R2 (S3-compatible)
- **Database**: MongoDB (Mongoose ODM)
- **File Upload**: Multer
- **Security**: Helmet, CORS, Express Rate Limit, Cloudflare Turnstile
- **Logging**: Winston
- **Process Manager**: PM2
- **Frontend**: HTML5, TailwindCSS, Particles.js

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance)
- Cloudflare R2 account with:
  - Bucket created
  - Access Key ID
  - Secret Access Key
  - API Endpoint
  - Public domain configured (optional but recommended)
- Cloudflare Turnstile site key and secret key
- Telegram Bot Token (for contact form, optional)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/GiftedTech-Nexus/gifted-cdn.git
   cd gifted-cdn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see [Configuration](#configuration))

5. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start

   # With PM2
   npm run pm2:start
   ```

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Cloudflare R2 Configuration
CF_REGION=auto
CF_BUCKET_NAME=files
CF_BUCKET_DOMAIN=files.giftedtech.co.ke
CF_ACCESS_KEY_ID=your_access_key_id
CF_SECRET_ACCESS_KEY=your_secret_access_key
CF_BUCKET_API_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com

# Cloudflare Turnstile
CF_TURNSTILE_SECRET_KEY=your_turnstile_secret_key
CF_TURNSTILE_API_URL=https://challenges.cloudflare.com

# MongoDB
MONGO_URI=mongodb://localhost:27017/gifted-cdn

# Telegram (Optional - for contact form)
BOT_TOKEN=your_telegram_bot_token
CHAT_ID=your_telegram_chat_id
TELEGRAM_API_URL=https://api.telegram.org

# Allowed MIME Types (Optional - defaults provided)
IMAGE_MIMETYPES=['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
VIDEO_MIMETYPES=['video/mp4', 'video/webm', 'video/quicktime']
AUDIO_MIMETYPES=['audio/mp3', 'audio/mpeg', 'audio/wav']
DOC_MIMETYPES=['application/pdf', 'application/msword', 'text/plain']
```

## 📚 API Documentation

### Base URL
```
https://cdn.giftedtech.web.id
```

### Endpoints

#### 1. Upload File

**Endpoint**: `POST /api/upload.php`

**Description**: Upload a file to the CDN with optional delete key protection.

**Request**:
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body Parameters:
  - `file` (required): The file to upload
  - `deleteKey` (optional): A secret key required for file deletion

**Response** (200 OK):
```json
{
  "name": "6Jexample_image.jpg",
  "path": "image/6Jexample_image.jpg",
  "url": "https://cdn.giftedtech.web.id/image/6Jexample_image.jpg",
  "size": "245 kB",
  "mimetype": "image/jpeg",
  "storageClass": "Standard",
  "modified": "May 18, 2025 1:49 PM",
  "expiry": "No Expiry Unless Deleted",
  "_id": "6465f3a7e4b0d4a9e4b0d4a9",
  "createdAt": "2025-05-18T12:34:56.789Z",
  "deleteKey": "your_delete_key_here"
}
```

**Error Responses**:
- `400 Bad Request`: No file uploaded or invalid file type
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

#### 2. Delete File

**Endpoint**: `DELETE /api/delete.php`

**Description**: Delete a file from the CDN. Requires the filename and delete key.

**Request**:
- Method: `DELETE`
- Content-Type: `application/json`
- Body:
```json
{
  "fileName": "6Jexample_image.jpg",
  "deleteKey": "your_secret_key"
}
```

**Response** (200 OK):
```json
{
  "name": "6Jexample_image.jpg",
  "path": "image/6Jexample_image.jpg",
  "url": "https://cdn.giftedtech.web.id/image/6Jexample_image.jpg",
  "size": "245 kB",
  "mimetype": "image/jpeg",
  "deleted": true,
  "deletedAt": "May 18, 2025 2:30 PM",
  "_id": "6465f3a7e4b0d4a9e4b0d4a9",
  "deletedFromDb": true,
  "deletedFromServer": true
}
```

**Error Responses**:
- `400 Bad Request`: Filename is required
- `403 Forbidden`: Invalid delete key or file cannot be deleted
- `404 Not Found`: File not found
- `500 Internal Server Error`: Server error

#### 3. Contact Form

**Endpoint**: `POST /api/sendMessage.php`

**Description**: Send a message via Telegram bot (contact form submission).

**Request**:
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body Parameters:
  - `name` (required): Sender's name
  - `email` (required): Sender's email
  - `phone` (optional): Sender's phone
  - `message` (required): Message content
  - `file` (optional): Attachment file

**Response** (200 OK):
```json
{
  "ok": true
}
```

## 📁 Project Structure

```
gifted-cdn/
├── api/
│   ├── index.js           # Main Express application
│   ├── client/
│   │   └── index.js       # Cloudflare R2 client (S3 SDK)
│   ├── db/
│   │   └── index.js       # MongoDB connection
│   └── models/
│       └── index.js       # File schema/model
├── public/
│   ├── index.html         # Upload page
│   ├── contact/
│   │   └── index.html     # Contact form page
│   ├── delete/
│   │   └── index.html     # Delete file page
│   └── docs/
│       └── index.html     # API documentation page
├── logs/                  # Winston logs directory
│   ├── error.log
│   └── combined.log
├── config.js              # Configuration management
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (not in repo)
├── .env.example           # Environment variables template
└── README.md              # This file
```

## 💻 Usage Examples

### Node.js (with Axios)

```javascript
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

// Upload file
const uploadFile = async (filePath, deleteKey) => {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  if (deleteKey) form.append('deleteKey', deleteKey);

  try {
    const response = await axios.post(
      'https://cdn.giftedtech.web.id/api/upload.php',
      form,
      { headers: form.getHeaders() }
    );
    console.log('Upload successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
    throw error;
  }
};

// Delete file
const deleteFile = async (fileName, deleteKey) => {
  try {
    const response = await axios.delete(
      'https://cdn.giftedtech.web.id/api/delete.php',
      { data: { fileName, deleteKey } }
    );
    console.log('Delete successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Delete failed:', error.response?.data || error.message);
    throw error;
  }
};

// Usage
uploadFile('./example.jpg', 'my_secret_key_123')
  .then(data => console.log('File URL:', data.url));
```

### Python (with Requests)

```python
import requests

# Upload file
def upload_file(file_path, delete_key=None):
    url = 'https://cdn.giftedtech.web.id/api/upload.php'
    
    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {'deleteKey': delete_key} if delete_key else {}
        response = requests.post(url, files=files, data=data)
    
    if response.status_code == 200:
        print('Upload successful:', response.json())
        return response.json()
    else:
        print('Upload failed:', response.text)
        raise Exception(response.text)

# Delete file
def delete_file(file_name, delete_key):
    url = 'https://cdn.giftedtech.web.id/api/delete.php'
    data = {
        'fileName': file_name,
        'deleteKey': delete_key
    }
    response = requests.delete(url, json=data)
    
    if response.status_code == 200:
        print('Delete successful:', response.json())
        return response.json()
    else:
        print('Delete failed:', response.text)
        raise Exception(response.text)

# Usage
result = upload_file('example.jpg', 'my_secret_key_123')
print('File URL:', result['url'])
```

### cURL

```bash
# Upload file
curl -X POST https://cdn.giftedtech.web.id/api/upload.php \
  -F "file=@example.jpg" \
  -F "deleteKey=my_secret_key_123"

# Delete file
curl -X DELETE https://cdn.giftedtech.web.id/api/delete.php \
  -H "Content-Type: application/json" \
  -d '{"fileName":"6Jexample.jpg","deleteKey":"my_secret_key_123"}'
```

## 🔒 Security Features

1. **Rate Limiting**: 10 uploads per 5 minutes per IP address
2. **Cloudflare Turnstile**: CAPTCHA verification on uploads
3. **Delete Key Protection**: Files can only be deleted with the correct key
4. **File Type Validation**: Only allowed MIME types can be uploaded
5. **File Size Limit**: Maximum 100MB per file
6. **Helmet.js**: Security headers protection
7. **CORS**: Controlled cross-origin access
8. **Input Sanitization**: Filename sanitization to prevent path traversal
9. **MongoDB Injection Protection**: Mongoose schema validation

## 🚀 Deployment

### Using PM2 (Recommended for Production)

```bash
# Install PM2 globally
npm run pm2:install

# Start application
npm run pm2:start:prod

# View logs
npm run pm2:logs

# Monitor
npm run pm2:monit

# Restart
npm run pm2:restart

# Stop
npm run pm2:stop

# Setup auto-restart on system reboot
npm run pm2:startup
npm run pm2:save
```

### Environment Variables for Production

Ensure the following are set in production:

```env
NODE_ENV=production
PORT=5000
```

### Nginx Reverse Proxy (Optional)

```nginx
server {
    listen 80;
    server_name cdn.giftedtech.web.id;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 100M;
}
```

## 📝 Scripts

```bash
# Development
npm run dev          # Start with nodemon (auto-reload)

# Production
npm start            # Start server
npm run pm2:start    # Start with PM2

# PM2 Management
npm run pm2:stop     # Stop PM2 process
npm run pm2:restart  # Restart PM2 process
npm run pm2:reload   # Reload without downtime
npm run pm2:delete   # Delete PM2 process
npm run pm2:logs     # View logs
npm run pm2:status   # View status
npm run pm2:monit    # Monitor resources

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm test             # Run tests
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Gifted Tech** - [GitHub](https://github.com/GiftedTech-Nexus)

## 🙏 Acknowledgments

- Cloudflare for R2 object storage
- AWS SDK for S3-compatible client
- Express.js community
- All contributors and users

## 📞 Support

For support, email support@giftedtech.co.ke or open an issue on GitHub.

## 🔗 Links

- [Live Demo](https://cdn.giftedtech.web.id)
- [API Documentation](https://cdn.giftedtech.web.id/docs)
- [GitHub Repository](https://github.com/GiftedTech-Nexus/gifted-cdn)

---

Made with ❤️ by [Gifted Tech](https://github.com/GiftedTech-Nexus)
