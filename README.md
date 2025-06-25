# 🖊️ MooseBoard

A lightweight, browser-based whiteboard for up to **6 users**. No database required and packaged for easy local hosting with Docker.

## Features
- Prompt for username on connect
- Host or join a session
- Host can enable/disable drawing for each user
- Dark mode (default) and light mode toggle
- Whiteboard centered and uses 80% of the window
- Zoom in up to 180%, never smaller than 100%

## Quick Start
```bash
# build and run
docker compose up --build
# then open your browser
open http://localhost:3000
```

## Environment Variables
- `PORT` – port to run on (default `3000`)

## Limitations
- In‑memory sessions – restarting the server clears the board
- Maximum of 6 connected users

## License
MIT
