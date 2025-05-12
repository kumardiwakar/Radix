# 🏆 Radix – Live Kabaddi Tournament Manager

**Radix** is a full-stack web application built to manage live Kabaddi tournaments. It allows players and organizers to interact with real-time match data including raiding points, tackle points, and bonus points. The platform provides secure authentication, player statistics, and tournament tracking to improve team performance and streamline event management.

## 🚀 Features

- 📋 **Tournament Management** – Create and manage multiple Kabaddi tournaments.
- 🎯 **Live Match Stats** – Real-time tracking of raid points, tackle points, bonus points.
- 👥 **User Authentication** – Login/register with secure access control using Passport.js.
- 📊 **Player Statistics** – View individual and team performance data.
- 🔐 **Role-based Access** – Separate views for players and organizers.

## 🛠 Tech Stack

### Frontend:
- HTML
- CSS
- JavaScript
- Bootstrap

### Backend:
- Node.js
- Express.js

### Database:
- MongoDB

### Authentication:
- Passport.js (with sessions)

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/radix.git
cd radix

# Install dependencies
npm install

# Set up environment variables (see `.env.example`)
cp .env.example .env

# Start the server
npm start
