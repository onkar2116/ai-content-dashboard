const mongoose = require('mongoose')

const analysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  inputText: {
    type: String,
    required: true,
  },
  summary: String,
  sentiment: String,
  topics: String,
  tone: String,
}, { timestamps: true })

module.exports = mongoose.model('Analysis', analysisSchema)
