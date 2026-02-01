# Gifted CDN API Documentation

## Overview

The Gifted CDN API provides RESTful endpoints for file management operations including upload, deletion, and contact form submissions. All responses are in JSON format.

## Base URL

```
https://cdn.giftedtech.co.ke
```

## Authentication

Currently, the API uses Cloudflare Turnstile for CAPTCHA verification on uploads. No API key authentication is required, but rate limiting is enforced.

## Rate Limiting

- **Upload Endpoints**: 10 requests per 5 minutes per IP address
- **Other Endpoints**: No rate limiting currently enforced

## Endpoints

### 1. Upload File

Upload a file to the CDN with automatic organization by file type.

**Endpoint**: `POST /api/upload.php`

**Headers**:
```
Content-Type: multipart/form-data
Turnstile-Token: <turnstile_response_token> (optional for /api/upload.php)
```

**Request Body** (multipart/form-data):
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | The file to upload (max 100MB) |
| deleteKey | String | No | Secret key for file deletion. If not provided, file cannot be deleted via API |

**Success Response** (200 OK):
```json
{
  "name": "6Jexample_image.jpg",
  "path": "image/6Jexample_image.jpg",
  "url": "https://cdn.giftedtech.co.ke/image/6Jexample_image.jpg",
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

- **400 Bad Request**
  ```json
  {
    "error": "No file uploaded"
  }
  ```
  or
  ```json
  {
    "error": "File type not allowed"
  }
  ```

- **429 Too Many Requests**
  ```json
  {
    "error": "Too many upload attempts, please try again later"
  }
  ```

- **500 Internal Server Error**
  ```json
  {
    "error": "Error message details"
  }
  ```

**File Organization**:
Files are automatically organized into folders based on MIME type:
- `image/` - All image files (JPEG, PNG, GIF, WebP, SVG, etc.)
- `video/` - All video files (MP4, WebM, MOV, AVI, etc.)
- `audio/` - All audio files (MP3, WAV, OGG, FLAC, etc.)
- `file/` - All document and other files (PDF, DOCX, ZIP, etc.)

**Supported File Types**:
- **Images**: JPEG, JPG, PNG, GIF, WebP, SVG, AVIF, HEIF, HEIC, ICO, TIFF
- **Videos**: MP4, WebM, QuickTime, AVI, MPEG, WMV, 3GP, MKV, OGG
- **Audio**: MP3, MP4, MPEG, WAV, OGG, WebM, MIDI, WMA, M4A, FLAC, AAC
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, HTML, CSS, JS, JSON, XML, ZIP, RAR, 7Z, TAR, GZIP, and many more

---

### 2. Delete File

Delete a file from the CDN. Requires the filename and the delete key that was provided during upload.

**Endpoint**: `DELETE /api/delete.php`

**Headers**:
```
Content-Type: application/json
```

**Request Body** (JSON):
```json
{
  "fileName": "6Jexample_image.jpg",
  "deleteKey": "your_secret_key"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| fileName | String | Yes | The name of the file to delete (from upload response) |
| deleteKey | String | Yes | The delete key provided during upload |

**Success Response** (200 OK):
```json
{
  "name": "6Jexample_image.jpg",
  "path": "image/6Jexample_image.jpg",
  "url": "https://cdn.giftedtech.co.ke/image/6Jexample_image.jpg",
  "size": "245 kB",
  "mimetype": "image/jpeg",
  "storageClass": "Standard",
  "expiry": "No Expiry Unless Deleted",
  "modified": "May 18, 2025 1:49 PM",
  "deleted": true,
  "deletedAt": "May 18, 2025 2:30 PM",
  "_id": "6465f3a7e4b0d4a9e4b0d4a9",
  "deletedFromDb": true,
  "deletedFromServer": true
}
```

**Error Responses**:

- **400 Bad Request**
  ```json
  {
    "error": "Filename is Required"
  }
  ```

- **403 Forbidden**
  ```json
  {
    "error": "File Cannot be Deleted (no delete key was set)"
  }
  ```
  or
  ```json
  {
    "error": "Invalid delete key"
  }
  ```

- **404 Not Found**
  ```json
  {
    "error": "File Not Found"
  }
  ```

- **500 Internal Server Error**
  ```json
  {
    "error": "Error message details"
  }
  ```

---

### 3. Contact Form Submission

Send a message via Telegram bot. This endpoint is used by the contact form on the website.

**Endpoint**: `POST /api/sendMessage.php`

**Headers**:
```
Content-Type: multipart/form-data
```

**Request Body** (multipart/form-data):
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | String | Yes | Sender's name |
| email | String | Yes | Sender's email address |
| phone | String | No | Sender's phone number |
| message | String | Yes | Message content |
| file | File | No | Optional file attachment |

**Success Response** (200 OK):
```json
{
  "ok": true
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "ok": false,
  "error": "Failed to send message"
}
```

---

## Code Examples

### JavaScript (Node.js with Axios)

#### Upload File
```javascript
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function uploadFile(filePath, deleteKey) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  if (deleteKey) {
    form.append('deleteKey', deleteKey);
  }

  try {
    const response = await axios.post(
      'https://cdn.giftedtech.co.ke/api/upload.php',
      form,
      {
        headers: form.getHeaders()
      }
    );
    console.log('Upload successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
uploadFile('./example.jpg', 'my_secret_key_123')
  .then(data => {
    console.log('File URL:', data.url);
    console.log('Delete Key:', data.deleteKey);
  });
```

#### Delete File
```javascript
const axios = require('axios');

async function deleteFile(fileName, deleteKey) {
  try {
    const response = await axios.delete(
      'https://cdn.giftedtech.co.ke/api/delete.php',
      {
        data: {
          fileName: fileName,
          deleteKey: deleteKey
        }
      }
    );
    console.log('Delete successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Delete failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
deleteFile('6Jexample_image.jpg', 'my_secret_key_123')
  .then(data => console.log('File deleted:', data.deleted));
```

---

### Python (with Requests)

#### Upload File
```python
import requests

def upload_file(file_path, delete_key=None):
    url = 'https://cdn.giftedtech.co.ke/api/upload.php'
    
    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {'deleteKey': delete_key} if delete_key else {}
        response = requests.post(url, files=files, data=data)
    
    if response.status_code == 200:
        result = response.json()
        print('Upload successful:', result)
        print('File URL:', result['url'])
        return result
    else:
        print('Upload failed:', response.text)
        raise Exception(response.text)

# Usage
result = upload_file('example.jpg', 'my_secret_key_123')
```

#### Delete File
```python
import requests

def delete_file(file_name, delete_key):
    url = 'https://cdn.giftedtech.co.ke/api/delete.php'
    data = {
        'fileName': file_name,
        'deleteKey': delete_key
    }
    
    response = requests.delete(url, json=data)
    
    if response.status_code == 200:
        result = response.json()
        print('Delete successful:', result)
        return result
    else:
        print('Delete failed:', response.text)
        raise Exception(response.text)

# Usage
delete_file('6Jexample_image.jpg', 'my_secret_key_123')
```

---

### PHP

#### Upload File
```php
<?php
$url = 'https://cdn.giftedtech.co.ke/api/upload.php';
$file_path = 'example.jpg';
$delete_key = 'my_secret_key_123';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);

$post_fields = [
    'file' => new CURLFile($file_path),
];

if (!empty($delete_key)) {
    $post_fields['deleteKey'] = $delete_key;
}

curl_setopt($ch, CURLOPT_POSTFIELDS, $post_fields);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code == 200) {
    $result = json_decode($response, true);
    echo 'Upload successful: ' . $result['url'] . PHP_EOL;
} else {
    echo 'Upload failed: ' . $response . PHP_EOL;
}
?>
```

#### Delete File
```php
<?php
$url = 'https://cdn.giftedtech.co.ke/api/delete.php';
$data = [
    'fileName' => '6Jexample_image.jpg',
    'deleteKey' => 'my_secret_key_123'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen(json_encode($data))
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code == 200) {
    echo 'Delete successful: ' . $response . PHP_EOL;
} else {
    echo 'Delete failed: ' . $response . PHP_EOL;
}
?>
```

---

### cURL (Command Line)

#### Upload File
```bash
# Upload with delete key
curl -X POST https://cdn.giftedtech.co.ke/api/upload.php \
  -F "file=@example.jpg" \
  -F "deleteKey=my_secret_key_123"

# Upload without delete key (file cannot be deleted)
curl -X POST https://cdn.giftedtech.co.ke/api/upload.php \
  -F "file=@example.jpg"
```

#### Delete File
```bash
curl -X DELETE https://cdn.giftedtech.co.ke/api/delete.php \
  -H "Content-Type: application/json" \
  -d '{"fileName":"6Jexample_image.jpg","deleteKey":"my_secret_key_123"}'
```

---

## Best Practices

1. **Always Store Delete Keys Securely**: If you provide a delete key during upload, store it securely. Without it, you cannot delete the file via the API.

2. **Use Unique Delete Keys**: Generate unique, random delete keys for each file to prevent unauthorized deletion.

3. **Handle Rate Limiting**: Implement exponential backoff when receiving 429 responses.

4. **Validate File Types**: Check file types on the client side before uploading to save bandwidth.

5. **Monitor File Sizes**: Keep files under 100MB to avoid upload failures.

6. **Error Handling**: Always implement proper error handling for API responses.

7. **Store File Metadata**: Save the response data (especially `url`, `name`, and `deleteKey`) for future reference.

---

## Error Handling

All error responses follow this general format:

```json
{
  "error": "Error message description"
}
```

Some errors may include additional details:

```json
{
  "error": "Invalid CAPTCHA response",
  "details": ["error-code-1", "error-code-2"]
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `400 Bad Request` - Invalid request parameters
- `403 Forbidden` - Access denied (invalid delete key)
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Support

For API support or questions:
- Email: support@giftedtech.co.ke
- GitHub Issues: [https://github.com/GiftedTech-Nexus/gifted-cdn/issues](https://github.com/GiftedTech-Nexus/gifted-cdn/issues)
- Documentation: [https://cdn.giftedtech.co.ke/docs](https://cdn.giftedtech.co.ke/docs)

---

## Changelog

### Version 1.2.6 (Current)
- File upload with automatic organization
- Delete key protection
- Rate limiting
- Cloudflare Turnstile integration
- MongoDB metadata storage
- Contact form via Telegram

---

Made with ❤️ by [Gifted Tech](https://github.com/GiftedTech-Nexus)
