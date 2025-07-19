# Video Chat Room App

This is a simple video chat room application built with Node.js, Express, and Socket.IO. It allows users to create or join rooms and communicate in real-time using WebRTC for peer-to-peer video/audio connections.

## Features
- Create and join unique video chat rooms
- Real-time participant list updates
- WebRTC signaling via Socket.IO
- User join/leave notifications
- Simple, static frontend (HTML/CSS/JS)

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher recommended)

### Installation
1. Clone the repository or download the source code.
2. Navigate to the project directory:
   ```bash
   cd /path/to/project
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Server
Start the server with:
```bash
node server.js
```
The server will run on [http://localhost:3000](http://localhost:3000) by default.

### Usage
1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. Click to create a new room or enter a room code to join an existing room.
3. Share the room code with others to have them join the same room.
4. Allow camera and microphone access when prompted.

## Project Structure
```
public/           # Static frontend files (HTML, CSS, JS)
  ├── css/
  ├── index.html  # Landing page
  └── room.html   # Room interface
server.js         # Express + Socket.IO backend
package.json      # Project metadata and dependencies
```

## API Endpoints
- `GET /` - Landing page
- `GET /room/:roomId` - Room page
- `GET /api/generate-room` - Generate a new unique room ID

## Socket.IO Events
- `join-room` - Join a room with a username
- `room-participants` - Receive current participant list
- `user-joined` - Notification when a user joins
- `user-left` - Notification when a user leaves
- `offer`, `answer`, `ice-candidate` - WebRTC signaling events
- `leave-room` - Leave the current room

## License
MIT
