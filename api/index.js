const fs = require('fs');
const path = require('path');
const axios = require('axios');
const express = require('express');
const File = require('./models'); 
const connectDB = require('./db');
const config = require('../config');
const multer = require('multer');
const FormData = require('form-data');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const { uploadFile, getFileUrl, deleteFile } = require('./client');

const app = express();

function makeId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = Math.floor(Math.random() * 4) + 2; // Random length between 2 and 4
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  
  return result;
}

// Logger 
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

function parseMimeTypes(mimeString) {
  try {
    return JSON.parse(mimeString.replace(/'/g, '"'));
  } catch (e) {
    logger.error('Error parsing MIME types:', e);
    return [];
  }
}

const ALLOWED_MIME_TYPES = [
  ...parseMimeTypes(config.imageMimetypes),
  ...parseMimeTypes(config.videoMimetypes),
  ...parseMimeTypes(config.audioMimetypes),
  ...parseMimeTypes(config.docMimetypes)
];

// Add CORS for headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());
app.set('trust proxy', 1);
app.set('json spaces', 2);
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, '../public')));

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads/reqs per ip per 1 min
  message: 'Too many upload attempts, please try again later'
});

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 
  }
});

const verifyTurnstile = async (req, res, next) => {
  const turnstileToken = req.headers['turnstile-token'] || req.headers['Turnstile-Token'];
  
  if (!turnstileToken) {
    logger.warn('Turnstile token missing in headers');
    return res.status(400).json({ error: 'CAPTCHA Response is Required' });
  }

  try {
    const response = await axios.post(
      `${config.cfTurnstileApiUrl}/turnstile/v0/siteverify`,
      new URLSearchParams({
        secret: config.cfTurnstileSecret,
        response: turnstileToken
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!response.data?.success) {
      logger.warn('Turnstile verification failed:', response.data);
      return res.status(400).json({ 
        error: 'Invalid CAPTCHA response',
        details: response.data['error-codes'] || []
      });
    }

    next();
  } catch (error) {
    logger.error('Turnstile verification error:', error);
    res.status(500).json({ 
      error: 'CAPTCHA verification failed',
      details: error.message 
    });
  }
};

const validateFile = (req, res, next) => {
  if (!req.file) {
    logger.warn('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
    logger.warn(`File type not allowed: ${req.file.mimetype}`);
    return res.status(400).json({ error: 'File type not allowed' });
  }

  next();
};

// Connect DB
connectDB();


app.post('/api/sendMessage.php', upload.single('file'), async (req, res) => {
  const { name, email, phone, message } = req.body;
  const file = req.file;

  try {
    const text = `NEW MESSAGE FROM CDN CONTACT FORM:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`;

    if (file) {
      const formData = new FormData();
      formData.append('chat_id', config.chatId);
      formData.append('caption', text);
      formData.append('document', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
      });

      const response = await axios.post(
        `${config.telegramApiUrl}/bot${config.botToken}/sendDocument`,
        formData,
        {
          headers: formData.getHeaders()
        }
      );

      if (response.data.ok) {
        res.json({ ok: true });
      } else {
        res.status(500).json({ ok: false, error: 'Failed to send message with attachment.' });
      }
    } else {
      const response = await axios.post(`${config.telegramApiUrl}/bot${config.botToken}/sendMessage`, {
        chat_id: config.chatId,
        text: text
      });

      if (response.data.ok) {
        res.json({ ok: true });
      } else {
        res.status(500).json({ ok: false, error: 'Failed to send message.' });
      }
    }
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ ok: false, error: 'An error occurred while sending the message.' });
  }
});


app.post('/giftedUpload.php', uploadLimiter, upload.single('file'), verifyTurnstile, validateFile, async (req, res) => {
  try {
    if (!req.file) {
      logger.warn('No file selected');
      return res.status(400).json({ error: 'No file selected' });
    }

    const uniqueFilename = `${makeId()}${req.file.originalname}`;
    logger.info(`Processing upload for file: ${uniqueFilename}`);

    const existingFile = await File.findOne({ name: uniqueFilename });
    if (existingFile) {
      logger.info(`File already exists, deleting previous version: ${uniqueFilename}`);
      await deleteFile(existingFile.path);
      await File.deleteOne({ _id: existingFile._id });
    }

    const fileInfo = await uploadFile(
      uniqueFilename,
      req.file.buffer, 
      req.file.mimetype
    );

    const fileDoc = new File({
      name: uniqueFilename,
      path: fileInfo.path,
      url: fileInfo.url,
      size: fileInfo.size,
      mimetype: fileInfo.mimetype,
      storageClass: fileInfo.storageClass,
      modified: fileInfo.modified,
      deleteKey: req.body.deleteKey 
    });

    await fileDoc.save();
    logger.info(`File uploaded successfully: ${uniqueFilename}`);

    res.json({
      ...fileInfo,
      _id: fileDoc._id,
      createdAt: fileDoc.createdAt,
      deleteKey: fileDoc.deleteKey 
    });

  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});


// Api Upload Endpoint
app.post('/api/upload.php', uploadLimiter, upload.single('file'), /*verifyTurnstile,*/ validateFile, async (req, res) => {
  try {
    if (!req.file) {
      logger.warn('No file selected');
      return res.status(400).json({ error: 'No file selected' });
    }

    const uniqueFilename = `${makeId()}${req.file.originalname}`;
    logger.info(`Processing upload for file: ${uniqueFilename}`);

    const existingFile = await File.findOne({ name: uniqueFilename });
    if (existingFile) {
      logger.info(`File already exists, deleting previous version: ${uniqueFilename}`);
      await deleteFile(existingFile.path);
      await File.deleteOne({ _id: existingFile._id });
    }

    const fileInfo = await uploadFile(
      uniqueFilename,
      req.file.buffer, 
      req.file.mimetype
    );

    const fileDoc = new File({
      name: uniqueFilename,
      path: fileInfo.path,
      url: fileInfo.url,
      size: fileInfo.size,
      mimetype: fileInfo.mimetype,
      storageClass: fileInfo.storageClass,
      modified: fileInfo.modified,
      deleteKey: req.body.deleteKey 
    });

    await fileDoc.save();
    logger.info(`File uploaded successfully: ${uniqueFilename}`);

    res.json({
      ...fileInfo,
      _id: fileDoc._id,
      createdAt: fileDoc.createdAt,
      deleteKey: fileDoc.deleteKey 
    });

  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});


app.route('/api/delete.php')
  .delete(async (req, res) => {
    try {
      const { fileName, deleteKey } = req.body;
      
      if (!fileName) {
        logger.warn('Delete request missing filename');
        return res.status(400).json({ error: 'Filename is Required' });
      }

      const fileDoc = await File.findOne({ name: fileName });
      if (!fileDoc) {
        logger.warn(`File not found for deletion: ${fileName}`);
        return res.status(404).json({ error: 'File Not Found' });
      }

      if (!fileDoc.deleteKey) {
        logger.warn(`Attempt to delete file without delete key: ${fileName}`);
        return res.status(403).json({ error: 'File Cannot be Deleted (no delete key was set)' });
      }
      if (fileDoc.deleteKey !== deleteKey) {
        logger.warn(`Invalid delete key provided for file: ${fileName}`);
        return res.status(403).json({ error: 'Invalid delete key' });
      }

      const deleteResult = await deleteFile(fileDoc.path);
      await File.deleteOne({ _id: fileDoc._id });
      logger.info(`File deleted successfully: ${fileName}`);

      res.json({
        ...deleteResult,
        _id: fileDoc._id,
        deletedFromDb: true,
        deletedFromServer: true
      });

    } catch (error) {
      logger.error('Delete file error:', error);
      res.status(500).json({ error: error.message });
    }
  });

// Not important as of now
app.route('/file/:filename')
  .get(async (req, res) => {
    try {
      if (!req.params.filename) {
        logger.warn('Get file request missing filename');
        return res.status(400).json({ error: 'Filename required' });
      }

      const fileDoc = await File.findOne({ path: req.params.filename });
      if (!fileDoc) {
        logger.warn(`File not found: ${req.params.filename}`);
        return res.status(404).json({ error: 'File not found' });
      }

      const fileInfo = await getFileUrl(fileDoc.path);
      logger.info(`File retrieved: ${req.params.filename}`);

      res.json({
        ...fileInfo,
        _id: fileDoc._id,
        createdAt: fileDoc.createdAt
      });

    } catch (error) {
      logger.error('Get file error:', error);
      res.status(500).json({ error: error.message });
    }
  });

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

