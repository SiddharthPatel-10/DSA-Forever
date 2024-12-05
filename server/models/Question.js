const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  tip: { type: String, required: true },
  link: { type: String, required: true },
});

module.exports = mongoose.model("Question", questionSchema);
