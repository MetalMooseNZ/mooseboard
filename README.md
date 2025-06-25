# 🖊️ Collaborative Whiteboard App

A lightweight, browser-based whiteboard app for up to **6 users** to connect, draw, and collaborate in real-time.

Designed for **quick setup**, **ease of use**, and **local hosting** using Docker.

---

## ✨ Features

- 🧑‍🤝‍🧑 Connect up to 6 users in a session
- 🔐 Prompt for username on connect
- 🎮 Host or Join a session easily
- 🛑 Host controls who can draw (enable/disable users)
- 🌙 Dark mode by default (toggle light mode)
- 🖼️ Central whiteboard takes 80% of the browser window
- 🔍 Whiteboard zooms in to 80% — no zoom out beyond 100%
- 🚫 No database required — uses simple in-memory sessions

---

## 📦 Quick Start (Docker)

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/whiteboard-app.git
cd whiteboard-app
2. Build and run with Docker Compose
bash
Copy
Edit
docker compose up --build
3. Access the app
Open your browser and go to: http://localhost:3000

🧠 How It Works
Hosting a Session
User chooses "Host Session"

Other users join via the host's IP or hostname

Host sees a list of connected users and can toggle their ability to draw

Joining a Session
User chooses "Join Session"

Enters a host address and a username

Joins the live whiteboard session with others

🖥️ UI Overview
Left Panel: List of connected users

Indicator shows who can draw

Host can enable/disable users

Top Centered Whiteboard: 80% width of the browser window

Real-time drawing for all enabled users

Zoom control (max 80% zoom-in, 100% baseline)

⚙️ Customization
Environment variables (optional):

Variable	Description	Default
PORT	Port for the app to run on	3000
THEME	Default theme (dark or light)	dark
MAX_USERS	Max number of users	6

🛠️ Tech Stack
Node.js + Express (Server)

WebSockets (Real-time drawing sync)

HTML5 Canvas (Whiteboard)

Vanilla JS + CSS (Lightweight frontend)

Docker + Docker Compose (Containerized deployment)

🚧 Limitations
No persistent storage (sessions are in-memory)

Max 6 users per session

Sessions reset when server restarts

🔐 Security Notes
This app is designed for local use only. If deploying publicly, consider:

HTTPS and secure WebSocket (WSS)

Authentication layers

Rate limiting / user validation

📄 License
MIT License © 2025 YourNameHere


