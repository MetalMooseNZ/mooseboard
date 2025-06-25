# 🖊️ MooseBoard

A lightweight, browser-based whiteboard for up to **6 users**. No database required and packaged for easy local hosting with Docker.

## Features
- Prompt for username on connect
- Users whose name begins with `!` gain admin powers
- Admins can clear the board via the right-click menu
- Right-click menu for toggling dark mode, synced across users
- Debug menu for admins to adjust maximum zoom
- Crisp drawings rendered using SVG
- Whiteboard fills the entire window
- Zoom with mouse wheel (default limit 130%, adjustable by admins)

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
