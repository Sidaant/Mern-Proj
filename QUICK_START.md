# QuizSync - Quick Start Guide

## 🚀 How to Use QuizSync

### For Hosts (Creating & Running Quizzes)

1. **Login**
   - Go to http://localhost:5173
   - Login with: `host@quizsync.com` / `password123`

2. **Create a Quiz**
   - Click "Create Quiz" on the dashboard
   - Enter quiz title and description
   - Add questions with 4 multiple choice options
   - Set the timer for each question (5-300 seconds)
   - Save your quiz

3. **Start a Game Session**
   - Click "Start Game" on any quiz
   - You'll get a 6-digit PIN
   - Click "Share Game" to get sharing options

4. **Invite Players**
   - **Option 1:** Share the PIN (e.g., "123456")
   - **Option 2:** Share the join link (e.g., "http://localhost:5173/play/123456")
   - **Option 3:** Use the Share button for native mobile sharing

5. **Run the Game**
   - Wait for players to join (you'll see them in the Players list)
   - Click "Start Question 1" to begin
   - Players answer questions in real-time
   - Click "Next Question" to move to the next question
   - Repeat until all questions are done
   - Click "End Game" to show final results

### For Players (Joining & Playing)

1. **Join a Game**
   - **Method 1:** Open the join link shared by the host
   - **Method 2:** Go to http://localhost:5173/play/[PIN]
   
2. **Enter Your Name**
   - Type your name and click "Join Game"
   - Wait for the host to start the quiz

3. **Play the Quiz**
   - Read each question carefully
   - Click your answer choice
   - Click "Submit Answer" before time runs out
   - Your score updates based on speed and correctness
   - View leaderboard after each question

4. **Final Results**
   - See your final ranking
   - View how many questions you got right
   - Check your total score

## 📱 Sharing Features

### Host Can Share Via:
- **Copy PIN** - Share the 6-digit code
- **Copy Link** - Share the full join URL
- **Native Share** - Use device sharing (mobile/web)

### Players Can Share Via:
- **Copy Join Link** - Share with friends
- **Direct URL** - Open the `/play/[PIN]` link

## 🎮 Game Flow Example

```
Host: Creates quiz → Starts session → Gets PIN "123456"
Host: Shares PIN/link with players
         ↓
Players: Join using PIN/link → Enter name
         ↓
Host: Sees players in list → Starts Question 1
         ↓
Players: Answer question within timer
         ↓
Host: Question locks → Views leaderboard → Starts Next Question
         ↓
[Repeat for all questions]
         ↓
Host: Ends game
         ↓
All: See final leaderboard
```

## 🔗 Sample Links

When hosting a game:
- **PIN Format:** 123456 (6 digits)
- **Join Link:** http://localhost:5173/play/123456
- **Host View:** http://localhost:5173/host/[session-id]

## 📊 Scoring System

- **Base Points:** 1000 points per correct answer
- **Speed Bonus:** Up to 500 points based on how fast you answer
- **Timing:** Faster answers = more points!

## 🛠️ Current Setup

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5001
- **MongoDB:** Running on localhost:27017
- **Demo User:** host@quizsync.com / password123

## 💡 Pro Tips

1. **For Best Experience:** Use the share link instead of just the PIN
2. **Mobile Friendly:** Works on phones, tablets, and computers
3. **Real-time Updates:** See players join and scores update live
4. **No Registration Needed:** Players just need the PIN/link
5. **Multiple Devices:** Test with multiple browser tabs/devices

## 🐛 Troubleshooting

- **Frontend not loading?** Check http://localhost:5173
- **Backend not responding?** Check http://localhost:5001/health
- **Can't connect?** Make sure both servers are running
- **PIN not working?** Make sure you're using the correct PIN






