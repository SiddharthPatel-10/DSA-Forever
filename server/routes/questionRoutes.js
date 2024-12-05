// routes/questionRoutes.js
const express = require("express");
const Question = require("../models/Question");

const router = express.Router();

// GET API: Fetch a random question
router.get("/random", async (req, res) => {
  try {
    const randomQuestion = await Question.aggregate([{ $sample: { size: 1 } }]);
    if (randomQuestion.length > 0) {
      const { question, tip, link } = randomQuestion[0];
      res.status(200).json({ question, tip, link });
    } else {
      res.status(404).json({ message: "No questions found" });
    }
  } catch (error) {
    console.error("Error in GET API:", error);
    res
      .status(500)
      .json({ message: "Error fetching question", error: error.message });
  }
});

// POST API: Add a new question and its tip
router.post("/", async (req, res) => {
  const { question, tip, link } = req.body;

  try {
    const newQuestion = new Question({ question, tip, link });
    await newQuestion.save();
    res
      .status(201)
      .json({ message: "Question added successfully", newQuestion });
  } catch (error) {
    res.status(500).json({ message: "Error adding question", error });
  }
});

// POST API: Add multiple questions and tips
router.post("/bulk", async (req, res) => {
  const questions = req.body; // Array of questions and tips

  try {
    // Insert all questions in bulk
    const insertedQuestions = await Question.insertMany(questions);
    res
      .status(201)
      .json({ message: "Questions added successfully", insertedQuestions });
  } catch (error) {
    res.status(500).json({ message: "Error adding questions", error });
  }
});

module.exports = router;
