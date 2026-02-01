# Deployment Guide - Gifted CDN

This guide covers various deployment options for the Gifted CDN application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
  - [Using PM2](#using-pm2)
  - [Using Docker](#using-docker)
  - [Using Systemd](#using-systemd)
- [Reverse Proxy Setup](#reverse-proxy-setup)
  - [Nginx](#nginx)
  - [Apache](#apache)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- Node.js v14 or higher
- npm or yarn
- MongoDB (local or cloud instance like MongoDB Atlas)
- Cloudflare R2 account with:
  - Bucket created
  - Access credentials (Access Key ID and Secret Access Key)
  - API endpoint URL
  - Optional: Custom domain configured for public access
- Cloudflare Turnstile site key and secret key
- (Optional) Telegram Bot Token for contact form
- (Optional) Domain name with DNS configured

---

## Environment Setup

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

4. **Configure environment variables**
   
   Edit `.env` file with your actual credentials:
   ```env
   # Server
   PORT=5000
   NODE_ENV=production

   # Cloudflare R2
   CF_REGION=auto
   CF_BUCKET_NAME=your-bucket-name
   CF_BUCKET_DOMAIN=your-bucket-domain.com
   CF_ACCESS_KEY_ID=your-access-key-id
   CF_SECRET_ACCESS_KEY=your-secret-access-key
   CF_BUCKET_API_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com

   # Cloudflare Turnstile
   CF_TURNSTILE_SECRET_KEY=your-turnstile-secret-key

   # MongoDB
   MONGO_URI=mongodb://localhost:27017/gifted-cdn
   # Or for MongoDB Atlas:
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gifted-cdn

   # Telegram (Optional)
   BOT_TOKEN=your-bot-token
   CHAT_ID=your-chat-id
   ```

---

## Local Development

Start the development server with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

---

## Production Deployment

### Using PM2 (Recommended)

PM2 is a production process manager for Node.js applications with built-in load balancer.

#### 1. Install PM2 globally
```bash
npm install pm2 -g
# or
npm run pm2:install
```

#### 2. Start the application
```bash
# Basic start
pm2 start api/index.js --name gifted-cdn

# Or use npm script
npm run pm2:start:prod
```

#### 3. Configure PM2 ecosystem file (Optional)

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'gifted-cdn',
    script: './api/index.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false
  }]
};
```

Start with ecosystem file:
```bash
pm2 start ecosystem.config.js --env production
```

#### 4. PM2 Management Commands
```bash
# View status
pm2 status

# View logs
pm2 logs gifted-cdn

# Monitor resources
pm2 monit

# Restart
pm2 restart gifted-cdn

# Reload (zero-downtime)
pm2 reload gifted-cdn

# Stop
pm2 stop gifted-cdn

# Delete from PM2
pm2 delete gifted-cdn
```

#### 5. Setup Auto-Restart on System Reboot
```bash
# Generate startup script
pm2 startup

# Save current process list
pm2 save
```

---

### Using Docker

#### 1. Create Dockerfile

Create `Dockerfile` in project root:
```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "api/index.js"]
```

#### 2. Create .dockerignore

Create `.dockerignore`:
```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
logs
```

#### 3. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    volumes:
      - ./logs:/usr/src/app/logs
    restart: unless-stopped
    depends_on:
      - mongodb

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

#### 4. Build and Run
```bash
# Build image
docker build -t gifted-cdn .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

### Using Systemd

Create a systemd service file for automatic startup and management.

#### 1. Create service file

Create `/etc/systemd/system/gifted-cdn.service`:
```ini
[Unit]
Description=Gifted CDN Service
After=network.target mongodb.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/gifted-cdn
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /var/www/gifted-cdn/api/index.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=gifted-cdn

[Install]
WantedBy=multi-user.target
```

#### 2. Enable and start service
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable gifted-cdn

# Start service
sudo systemctl start gifted-cdn

# Check status
sudo systemctl status gifted-cdn

# View logs
sudo journalctl -u gifted-cdn -f
```

---

## Reverse Proxy Setup

### Nginx

#### 1. Install Nginx
```bash
sudo apt update
sudo apt install nginx
```

#### 2. Create Nginx configuration

Create `/etc/nginx/sites-available/gifted-cdn`:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name cdn.giftedtech.web.id;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name cdn.giftedtech.web.id;

    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/cdn.giftedtech.web.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cdn.giftedtech.web.id/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Max upload size
    client_max_body_size 100M;

    # Proxy settings
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Access and error logs
    access_log /var/log/nginx/gifted-cdn-access.log;
    error_log /var/log/nginx/gifted-cdn-error.log;
}
```

#### 3. Enable site and restart Nginx
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/gifted-cdn /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

### Apache

#### 1. Install Apache and enable modules
```bash
sudo apt update
sudo apt install apache2
sudo a2enmod proxy proxy_http ssl rewrite headers
```

#### 2. Create Apache configuration

Create `/etc/apache2/sites-available/gifted-cdn.conf`:
```apache
<VirtualHost *:80>
    ServerName cdn.giftedtech.web.id
    
    # Redirect to HTTPS
    Redirect permanent / https://cdn.giftedtech.web.id/
</VirtualHost>

<VirtualHost *:443>
    ServerName cdn.giftedtech.web.id

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/cdn.giftedtech.web.id/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/cdn.giftedtech.web.id/privkey.pem

    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"

    # Proxy settings
    ProxyPreserveHost On
    ProxyPass / http://localhost:5000/
    ProxyPassReverse / http://localhost:5000/

    # Max upload size
    LimitRequestBody 104857600

    # Logs
    ErrorLog ${APACHE_LOG_DIR}/gifted-cdn-error.log
    CustomLog ${APACHE_LOG_DIR}/gifted-cdn-access.log combined
</VirtualHost>
```

#### 3. Enable site and restart Apache
```bash
# Enable site
sudo a2ensite gifted-cdn

# Test configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2
```

---

## SSL/TLS Configuration

### Using Let's Encrypt (Certbot)

#### 1. Install Certbot
```bash
# For Nginx
sudo apt install certbot python3-certbot-nginx

# For Apache
sudo apt install certbot python3-certbot-apache
```

#### 2. Obtain SSL certificate
```bash
# For Nginx
sudo certbot --nginx -d cdn.giftedtech.web.id

# For Apache
sudo certbot --apache -d cdn.giftedtech.web.id
```

#### 3. Auto-renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up a cron job for renewal
```

---

## Monitoring and Logging

### Application Logs

Logs are stored in the `logs/` directory:
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs gifted-cdn

# Web-based monitoring (PM2 Plus)
pm2 plus
```

### System Monitoring

Install monitoring tools:
```bash
# Install htop for system monitoring
sudo apt install htop

# Install netdata for comprehensive monitoring
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

---

## Backup and Recovery

### Database Backup

#### MongoDB Backup
```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/gifted-cdn" --out=/backup/mongodb/$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://localhost:27017/gifted-cdn" /backup/mongodb/20250118
```

#### Automated Backup Script

Create `backup.sh`:
```bash
#!/bin/bash

BACKUP_DIR="/backup/gifted-cdn"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --uri="mongodb://localhost:27017/gifted-cdn" --out="$BACKUP_DIR/mongodb_$DATE"

# Backup application files
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" /var/www/gifted-cdn --exclude=node_modules --exclude=logs

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

Add to crontab for daily backups:
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/gifted-cdn-backup.log 2>&1
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>
```

#### 2. MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongodb

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongodb
```

#### 3. File Upload Fails
- Check file size (max 100MB)
- Verify Cloudflare R2 credentials
- Check network connectivity to R2 endpoint
- Review application logs

#### 4. High Memory Usage
```bash
# Check memory usage
free -h

# Restart application
pm2 restart gifted-cdn

# Or configure max memory restart in PM2
pm2 start api/index.js --max-memory-restart 1G
```

#### 5. Nginx/Apache Not Starting
```bash
# Test configuration
sudo nginx -t
# or
sudo apache2ctl configtest

# Check error logs
sudo tail -f /var/log/nginx/error.log
# or
sudo tail -f /var/log/apache2/error.log
```

### Debug Mode

Enable debug logging:
```bash
# Set environment variable
export DEBUG=*

# Or in .env file
DEBUG=*
NODE_ENV=development
```

---

## Performance Optimization

### 1. Enable Gzip Compression (Nginx)
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### 2. Enable Caching (Nginx)
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. PM2 Cluster Mode
```bash
# Use all CPU cores
pm2 start api/index.js -i max
```

### 4. MongoDB Indexing
```javascript
// Add indexes in MongoDB
db.files.createIndex({ "name": 1 });
db.files.createIndex({ "createdAt": -1 });
```

---

## Security Checklist

- [ ] Use HTTPS with valid SSL certificate
- [ ] Keep Node.js and dependencies updated
- [ ] Use strong MongoDB credentials
- [ ] Enable firewall (UFW/iptables)
- [ ] Implement rate limiting
- [ ] Regular security audits (`npm audit`)
- [ ] Backup database regularly
- [ ] Monitor logs for suspicious activity
- [ ] Use environment variables for secrets
- [ ] Disable directory listing
- [ ] Keep Cloudflare R2 credentials secure

---

## Support

For deployment assistance:
- Email: support@giftedtech.co.ke
- GitHub Issues: https://github.com/GiftedTech-Nexus/gifted-cdn/issues

---

Made with ❤️ by [Gifted Tech](https://github.com/GiftedTech-Nexus)
