# Changelog

All notable changes to the Gifted CDN project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.6] - 2025-01-18

### Added
- File upload functionality with Cloudflare R2 storage
- Automatic file organization by type (image, video, audio, file)
- Delete key protection for secure file deletion
- Rate limiting (10 uploads per 5 minutes per IP)
- Cloudflare Turnstile CAPTCHA integration
- MongoDB integration for file metadata storage
- Winston logging system for error tracking
- Contact form with Telegram bot integration
- Responsive web interface with Particles.js animations
- PM2 process management support
- CORS support for cross-origin requests
- Helmet.js security headers
- File type validation
- File size limit (100MB)
- API documentation page
- Delete file page
- Contact form page

### Features
- **Upload Endpoint** (`POST /api/upload.php`)
  - Multipart file upload
  - Optional delete key
  - Automatic file organization
  - File metadata tracking
  
- **Delete Endpoint** (`DELETE /api/delete.php`)
  - Secure deletion with delete key
  - Database and storage cleanup
  
- **Contact Form** (`POST /api/sendMessage.php`)
  - Telegram bot integration
  - File attachment support

### Security
- Rate limiting on upload endpoints
- CAPTCHA verification
- Delete key protection
- Input sanitization
- File type validation
- CORS configuration
- Security headers via Helmet.js

### Infrastructure
- Express.js server
- MongoDB with Mongoose ODM
- Cloudflare R2 object storage
- AWS S3 SDK for R2 compatibility
- Multer for file uploads
- Winston for logging
- PM2 for process management

### Documentation
- README.md with comprehensive project overview
- API.md with detailed API documentation
- DEPLOYMENT.md with deployment guides
- CONTRIBUTING.md with contribution guidelines
- .env.example for environment configuration

## [1.2.5] - 2025-01-10

### Changed
- Improved error handling in upload process
- Enhanced logging for better debugging
- Updated dependencies to latest versions

### Fixed
- File upload timeout issues
- Memory leak in file processing
- CORS configuration for specific origins

## [1.2.0] - 2024-12-15

### Added
- Initial public release
- Basic file upload functionality
- Cloudflare R2 integration
- MongoDB storage for metadata
- Simple web interface

### Changed
- Migrated from local storage to Cloudflare R2
- Improved file naming convention

## [1.1.0] - 2024-11-20

### Added
- Delete functionality with key protection
- Rate limiting on uploads
- Basic logging system

### Fixed
- File overwrite issues
- Database connection stability

## [1.0.0] - 2024-10-01

### Added
- Initial release
- Basic file upload to local storage
- Simple Express server
- MongoDB integration

---

## Upcoming Features

### [1.3.0] - Planned
- [ ] User authentication system
- [ ] File sharing with expiration links
- [ ] Batch file upload
- [ ] File compression options
- [ ] Advanced analytics dashboard
- [ ] API rate limiting per user
- [ ] Webhook notifications
- [ ] File preview generation
- [ ] Search functionality
- [ ] Admin dashboard

### [1.4.0] - Planned
- [ ] Multi-user support
- [ ] File versioning
- [ ] Folder organization
- [ ] Public/private file access control
- [ ] CDN caching optimization
- [ ] Image transformation API
- [ ] Video transcoding
- [ ] Automated backups
- [ ] Two-factor authentication
- [ ] OAuth integration

---

## Version History

| Version | Release Date | Status |
|---------|--------------|--------|
| 1.2.6   | 2025-01-18   | Current |
| 1.2.5   | 2025-01-10   | Stable |
| 1.2.0   | 2024-12-15   | Stable |
| 1.1.0   | 2024-11-20   | Stable |
| 1.0.0   | 2024-10-01   | Stable |

---

## Migration Guides

### Migrating from 1.2.5 to 1.2.6

No breaking changes. Simply update dependencies:

```bash
npm install
```

### Migrating from 1.2.0 to 1.2.5

Update environment variables:
- Add `CF_TURNSTILE_SECRET_KEY` to `.env`
- Update `MONGO_URI` format if using MongoDB Atlas

---

## Support

For questions about changes or upgrades:
- Email: support@giftedtech.co.ke
- GitHub Issues: https://github.com/GiftedTech-Nexus/gifted-cdn/issues
- Documentation: https://cdn.giftedtech.web.id/docs

---

Made with ❤️ by [Gifted Tech](https://github.com/GiftedTech-Nexus)
