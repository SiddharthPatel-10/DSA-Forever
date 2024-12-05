const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const getQuestionAndTip = require("./utils/generateQuestion");
const sendEmail = require("./utils/sendEmail");
const User = require("./models/User");
const questionRoutes = require("./routes/questionRoutes");
const userRoutes = require("./routes/userRoutes");
const cron = require("node-cron");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/questions", questionRoutes);
app.use("/api/users", userRoutes);

async function sendDailyEmail() {
  try {
    const user = await User.findOne();
    if (!user) {
      console.log("No users found");
      return;
    }

    const { points, streak } = user;
    const { question, tip, link } = await getQuestionAndTip();

    const html = `
        <div style="font-family: 'Arial', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 12px; background-color: #f7fcff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
  <h2 style="text-align: center; color: #1d3557; font-size: 26px; font-weight: 700; letter-spacing: 1px;">✨ Your Daily DSA Challenge ✨</h2>

  <p style="font-size: 16px; color: #1d3557; text-align: center; margin-bottom: 15px; font-weight: bold;">
    <strong>💰 Points:</strong> <span style="color: #2a9d8f;">${points}</span> &nbsp;&nbsp;|&nbsp;&nbsp; <strong>🔥 Streak:</strong> <span style="color: #e63946;">${streak}</span>
  </p>

  <div style="background: linear-gradient(135deg, #dff9fb, #c7ecee); padding: 20px; border-radius: 12px; margin-bottom: 20px; animation: fadeIn 1s ease-in;">
    <h3 style="font-size: 20px; color: #264653; margin-bottom: 10px; font-weight: 600;">📌 Today's Question:</h3>
    <p style="font-size: 16px; color: #555; line-height: 1.6;">${question}</p>
  </div>

  <div style="background: linear-gradient(135deg, #ffeaa7, #fab1a0); padding: 20px; border-radius: 12px; animation: fadeIn 1.5s ease-in;">
    <h3 style="font-size: 20px; color: #264653; margin-bottom: 10px; font-weight: 600;">💡 Pro Tip:</h3>
    <p style="font-size: 16px; color: #555; line-height: 1.6;">${tip}</p>
  </div>

  <div style="text-align: center; margin-top: 25px;">
    <a href="${link}" style="display: inline-block; padding: 15px 35px; background-color: #2a9d8f; color: white; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: bold; letter-spacing: 1px; transition: all 0.3s ease;">
      Solve Now 🚀
    </a>
  </div>

  <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #6c757d; font-style: italic;">
    Keep pushing! You're on a roll! 💪
  </p>

  <style>
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    a:hover {
      background-color: #1f8e7e;
      transform: translateY(-5px);
      box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
    }
  </style>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
  </style>
</div>

    `;

    await sendEmail(user.email, "Your Daily DSA Challenge", html);
    console.log("Daily email sent successfully!");
  } catch (error) {
    console.error("Error sending daily email:", error);
  }
}

async function updateDailyPointsAndStreak() {
  try {
    const users = await User.find();

    users.forEach(async (user) => {
      user.points += 10;
      user.streak += 1;

      await user.save();
      console.log(`User ${user._id} daily points and streak updated`);
    });
  } catch (error) {
    console.error("Error updating daily points and streak:", error);
  }
}

cron.schedule(
  "00 05 * * *",
  () => {
    console.log("Running scheduled tasks at 5:00 AM IST");

    sendDailyEmail();
    updateDailyPointsAndStreak();
  },
  {
    timezone: "Asia/Kolkata",
  }
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
