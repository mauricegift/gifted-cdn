/**
 * File Model
 *
 * Mongoose schema and model for file metadata storage.
 * Stores information about uploaded files including URLs, sizes, and delete keys.
 *
 * @module api/models
 */

const mongoose = require("mongoose");

/**
 * File Schema
 *
 * @typedef {Object} FileSchema
 * @property {string} name - Unique filename with prefix
 * @property {string} path - Full path in R2 storage (e.g., "image/filename.jpg")
 * @property {string} url - Public URL to access the file
 * @property {string} size - Human-readable file size (e.g., "245 kB")
 * @property {string} mimetype - MIME type of the file
 * @property {string} storageClass - R2 storage class (default: "Standard")
 * @property {string} modified - Last modified timestamp
 * @property {string|null} deleteKey - Optional key required for file deletion
 * @property {Date} createdAt - Auto-generated creation timestamp
 * @property {Date} updatedAt - Auto-generated update timestamp
 */
const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  path: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: String, required: true },
  mimetype: { type: String, required: true },
  storageClass: { type: String, default: 'Standard' },
  modified: { type: String, required: true },
  deleteKey: { 
    type: String,
    default: null
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

/**
 * File Model
 * @type {mongoose.Model}
 */
module.exports = mongoose.model('File', fileSchema);
