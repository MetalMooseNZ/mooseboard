# 🖊️ Multi-User Live Whiteboard (Docker Hosted)

A browser-based, real-time, multi-user whiteboard app hosted via Docker. Each user is prompted for a username on entry and can collaboratively draw with others in a shared online space. Drawings update live across all connected users with crisp, SVG-based lines.

---

## ✨ Features

- 🔌 Docker-hosted, simple deployment
- 🌐 Browser-based with real-time updates via WebSocket
- 👥 Up to 6+ users per session
- 🎨 Each user gets a randomly assigned unique pen color
- ✍️ Sharp SVG drawing, with smooth line rendering
- 🌓 Dark mode UI (default) with floating user list
- 🧭 Easy navigation: pan, zoom, and contextual controls

---

## 🛠 Tech Stack (Simple but Scalable)

| Purpose             | Tech                       |
|---------------------|----------------------------|
| Backend             | Node.js + Express          |
| WebSockets          | `socket.io`                |
| Frontend            | Vanilla JS + HTML5 + SVG   |
| Containerization    | Docker                     |
| Styling             | CSS (with dark mode)       |

---

## 🔧 Controls

| Input                  | Action                                      |
|------------------------|---------------------------------------------|
| **Left Click + Hold**  | Draw with assigned user color               |
| **Right Click**        | Opens context menu (e.g. Clear Board)       |
| **Middle Click + Hold**| Pan the canvas when zoomed in               |
| **Scroll Wheel**       | Zoom in/out (100% - 140%)                   |

**Note:** Only left-click initiates drawing. Drawing only stops on `mouseleave` to prevent disruption during fast strokes.

---

## 🖼️ UI Layout

- The whiteboard takes up **100% of the browser window**.
- A **floating user list** is displayed at the top-left corner, showing connected usernames in their assigned colors.

---

## 🎨 Color & Visuals

- **Dark Mode (default):**
  - Whiteboard background: `#2c2f38`
  - Line colors: Random per user, with enforced contrast between users
- **Drawing Layer:** High-fidelity SVG for sharp and scalable rendering

---

## 🚀 Getting Started

### Prerequisites

- Docker installed on your local machine

### Setup

1. Clone this repository:

```bash
git clone https://github.com/MetalMooseNZ/mooseboard.git
cd mooseboard
```

2. Build and run the Docker container:
Run the Docker container:




docker build -t mooseboard .
docker run -p 3000:3000 mooseboard
Open your browser and go to:

arduino

http://localhost:3000




3. Open your browser and go to:

```
http://localhost:3000
```

---

## 🧹 Context Menu Actions
- **Clear Board**: Removes all drawings for all users (host command)

---

## 🧪 Roadmap (Optional Features)
- Add Light Mode toggle
- Host/join named sessions
- User inactivity timeout handling
- Save board snapshot as image
