var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var MessageSchema = new Schema({
  to: String,
  from: String,
  message: String,
  score: Number,
  spamcheck: String,
  createdAt: Date,
  groupid:String,
  isfile: { type: Boolean, default: false },
  ext: String,
  file: String,
  original: String,
  isdeleted: { type: Boolean, default: false }
});
module.exports = mongoose.model('Message', MessageSchema);