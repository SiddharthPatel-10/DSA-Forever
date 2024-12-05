const Question = require("../models/Question");

async function getQuestionAndTip() {
  const questions = await Question.aggregate([{ $sample: { size: 1 } }]);
  if (questions.length > 0) {
    const { question, tip, link } = questions[0];
    return { question, tip, link };
  } else {
    return {
      question: "No questions available",
      tip: "No tip available",
      link: "",
    };
  }
}

module.exports = getQuestionAndTip;
