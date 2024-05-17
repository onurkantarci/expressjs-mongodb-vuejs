const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: String,
  description: String,
});

module.exports = mongoose.model("Note", noteSchema);
