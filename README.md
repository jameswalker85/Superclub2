# SuperClub Companion & League Manager

A responsive, board game companion app for **SuperClub**, featuring league table tracking, custom color themes, automated point bands & milestone rewards, interactive fixture generation, and off-season management.

## 🚀 How to Run

### Option 1: Standalone Single File (Offline / No Server Needed)
When you build with `npm run build`, Vite produces a single self-contained file in `dist/index.html`. You can double-click this file directly to open and run the entire app in Chrome or any browser without running a server or installing anything!

### Option 2: Run Locally (Development)
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 3: Deploy to GitHub Pages
1. Push this repository to GitHub.
2. In your repo, go to **Settings** > **Pages**.
3. Under **Build and deployment**, set Source to **GitHub Actions** (or deploy the `dist/` directory).
4. Your companion app will be live on the web!

## ⚽ Features
- **Live League Table**: Tracks Victory Points, Squad Stars, Seasons Won, and point bands (Newly Promoted to Title Contender).
- **Gameweek & Fixtures Manager**: Generates balanced round-robin schedules for 2–6 players, PvP and Sim match modes, and halftime team talk triggers.
- **Off-Season & Pre-Season Steps**: Step-by-step manager walkthroughs including placement payouts, wage deductions, draft order, and club infrastructure investment selectors (Training, Scouting, Stadium).
- **Offline Persistent Audio & Confetti**: Custom sound effects and Supercup celebration mechanics.
