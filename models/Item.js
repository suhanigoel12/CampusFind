const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an item title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description of the item'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: [
          'Electronics',
          'Books & Stationery',
          'Clothing & Accessories',
          'Cards & IDs',
          'Keys',
          'Bags & Wallets',
          'Personal Belongings',
          'Other'
        ],
        message: '{VALUE} is not a supported category'
      }
    },
    type: {
      type: String,
      required: [true, 'Please specify whether the item is lost or found'],
      enum: {
        values: ['lost', 'found'],
        message: 'Type must be either "lost" or "found"'
      }
    },
    location: {
      type: String,
      required: [true, 'Please specify the campus location where the item was lost or found'],
      trim: true,
      maxlength: [150, 'Location description cannot exceed 150 characters']
    },
    date: {
      type: Date,
      default: Date.now
    },
    itemStatus: {
      type: String,
      enum: {
        values: ['open', 'claimed', 'resolved'],
        message: 'Status must be "open", "claimed", or "resolved"'
      },
      default: 'open'
    },
    contactInfo: {
      type: String,
      required: [true, 'Please provide contact information (phone number, email, or campus office)'],
      trim: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolutionNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Index for full-text search on title, description, and location
itemSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Item', itemSchema);
