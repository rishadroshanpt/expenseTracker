# 💰 ExpenseTracker

![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D16.x-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-blue)
![Vercel](https://img.shields.io/badge/deployed-vercel-black)
![Status](https://img.shields.io/badge/status-active-success)

A simple expense tracker web application built to help you manage personal finances by logging and visualizing your expenses and incomes easily. Designed for personal use and built with modern full-stack technologies.

🚀 **Live Demo:** https://roshans-expense-tracker.vercel.app/

---

## 🧠 Features

- ✅ Add, edit, and delete expenses & incomes  
- 📊 Dashboard with financial summaries  
- 📅 Filter by date or category  
- 💾 Persistent storage with backend API  
- 🧩 Full-stack architecture (client + server)  
- 🛠 Built with TypeScript and modern tooling  


## 📁 Project Structure.
```

├── client/                 # Frontend application (React/Vite)
├── server/                 # Backend API (Node.js/Express or similar)
├── shared/                 # Shared type definitions / utilities
├── public/                 # Static assets
├── .env.example            # Environment variable template
├── README.md               # This file
├── package.json
└── ...
```


##🧰 Tech Stack

| Layer      | Technology                   |
| ---------- | ---------------------------- |
| Frontend   | React, TypeScript, Vite      |
| Backend    | Node.js, TypeScript, Express |
| Database   | (Configured via Server)      |
| Styling    | Tailwind CSS (likely)        |
| Deployment | Vercel (frontend)            |
| Scripts    | pnpm / npm                   |



🚀 Getting Started
🔁 Requirements

Node.js (v16+)

npm or pnpm

🧩 Setup — Clone & Install
# Clone the repo
git clone https://github.com/rishadroshanpt/expenseTracker.git
cd expenseTracker

# Install dependencies (root)
npm install

# Install frontend & backend deps
cd client && npm install
cd ../server && npm install

⚙️ Environment Variables

Copy and configure environment variables from the example:

cp .env.example .env


Update values such as API URLs, keys, database connection strings, etc.

🧠 Run Locally
🟢 Start Backend
cd server
npm run dev

🔵 Start Frontend
cd client
npm run dev


Visit in your browser:

http://localhost:3000   (frontend)
http://localhost:5000   (API)


(Ports may vary based on your config.)

🧪 Testing

Add test commands here if your project includes tests:

# Example:
npm test

🛠 Deployment

You can deploy the frontend via Vercel, Netlify, or similar, and host the backend on Heroku, Render, or Railway.

Example (Vercel):

Push repo to GitHub

Import in Vercel

Set environment variables

Deploy

🧑‍🤝‍🧑 Contributing

Contributions are welcome!

Fork repository

Create a feature branch

Submit a pull request

📄 License

MIT License

Copyright (c) 2024 Rishad Roshan

❤️ Credits

Built and maintained by @rishadroshanpt.
