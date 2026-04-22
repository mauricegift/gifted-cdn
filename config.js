const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '.env'),
  quiet: true,
  override: false,
});

module.exports = {
port: process.env.PORT || '5000',
cfRegion: process.env.CF_REGION || "auto",
chatId: process.env.CHAT_ID || '', // For Telegram Contact Form Submission
cfBucketName: process.env.CF_BUCKET_NAME || "files", // Your Cloudflare R2 Bucket Name
telegramApiUrl: process.env.TELEGRAM_API_URL || "https://api.telegram.org", // Maintain this 
botToken: process.env.BOT_TOKEN || '', // For Telegram Contact Form Submission
cfBucketDomain: process.env.CF_BUCKET_DOMAIN || "files.giftedtech.co.ke", // Your Cloudflare R2 Public Access Domain/Your Custom Binded Domain
cfTurnstileSecret: process.env.CF_TURNSTILE_SECRET_KEY || "", // Your Cloudflare Turnstile Secret Key
cfAccessKeyId: process.env.CF_ACCESS_KEY_ID || "", // Your Cloudflare Access Key Id
cfTurnstileApiUrl: process.env.CF_TURNSTILE_API_URL || "https://challenges.cloudflare.com",
cfApiEndpoint: process.env.CF_BUCKET_API_ENDPOINT || "", // Your Cloudflare Bucket Storage Api Endpoint
cfSecretAccessKey: process.env.CF_SECRET_ACCESS_KEY || "",// Your Cloudflare Secret Access Key
mongoUri: process.env.MONGO_URI || "", // Your MongoDb Uri
imageMimetypes: process.env.IMAGE_MIMETYPES || "['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif', 'image/heif', 'image/heic', 'image/x-icon', 'image/tiff']",
audioMimetypes: process.env.AUDIO_MIMETYPES || "['audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/x-midi', 'audio/midi', 'audio/x-ms-wma', 'audio/x-m4a', 'audio/flac', 'audio/aac', 'audio/webm', 'audio/wave']",
videoMimetypes: process.env.VIDEO_MIMETYPES || "['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi', 'video/mpeg', 'video/x-ms-wmv', 'video/3gpp2', 'video/3gpp', 'video/x-matroska', 'video/ogg']",
docMimetypes: process.env.DOC_MIMETYPES || "['text/plain', 'text/html', 'text/css', 'text/javascript', 'text/csv', 'text/vcard', 'text/x-vcard', 'text/vcf', 'text/xml', 'text/markdown', 'text/rtf', 'application/pdf', 'application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.oasis.opendocument.text', 'application/vnd.oasis.opendocument.spreadsheet', 'application/vnd.oasis.opendocument.presentation', 'application/rtf', 'application/x-abiword', 'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip', 'application/x-bzip', 'application/x-bzip2', 'application/json', 'application/ld+json', 'application/xml', 'application/javascript', 'application/typescript', 'application/x-httpd-php', 'application/x-yaml', 'application/graphql', 'application/graphql', 'application/sql', 'font/ttf', 'font/otf', 'font/woff', 'font/woff2', 'application/x-font-ttf', 'application/x-font-otf', 'application/font-woff', 'application/font-woff2', 'application/octet-stream', 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/calendar', 'application/vnd.android.package-archive', 'application/x-msdownload', 'application/x-apple-diskimage']",
};


