# 🚀 CodeHub: Programming Learning & Practice Platform

CodeHub is a simple learning platform where students can explore programming languages, search programs, and save bookmarks.

This project is built as a BCA final year project using frontend + backend integration.

---

## ✨ Features

- Multiple programming languages
- Separate pages for each language
- Program search functionality
- Shows first 5 programs initially
- User Signup & Login system
- Bookmark programs
- Bookmarks tab to view saved items
- Clean Bootstrap UI
- Beginner-friendly design

---

## 🧠 Tech Stack

### Frontend
- HTML
- CSS
- Bootstrap
- JavaScript

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcrypt

---

## 📁 Folder Structure

```
code_hub/
│
├── backend/
│   ├── models/
│   │   └── User.js
│   ├── public/
│   │   ├── index.html
│   │   ├── dashboard.html
│   │   ├── languages.html
│   │   ├── CPrograms.html
│   │   └── js/
│   │       └── main.js
│   ├── server.js
│   └── .env
```

---

## ⚙️ Setup Instructions

### 1) Install dependencies

```
npm install
```

### 2) Create .env file

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 3) Run server

```
node server.js
```

Open in browser:

```
http://localhost:3000
```

---

## 🔐 Authentication Flow

### Signup
- User creates account
- Password stored securely
- JWT token generated
- Redirect to Languages Playground

### Login
- User logs in
- Token saved in localStorage
- Redirect to Languages Playground

---

## ⭐ Bookmark System

- Users can bookmark programs
- Bookmarks stored in MongoDB
- Each user has their own saved list
- Accessible from Bookmarks tab

---

## 🎯 Purpose

This project helps students:

- Learn programming basics
- Practice searching programs
- Save important examples
- Understand full-stack development

---

## 🔮 Future Improvements

- Code execution feature
- User profile page
- Comments on programs
- Difficulty filters
- Admin panel

---

## 👨‍💻 Author

Sonali Pal
