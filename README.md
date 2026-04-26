# 🐙 MyGitHub — Full Stack GitHub Clone

> A fully deployed, full-stack web application inspired by GitHub — built with React, Node.js, MongoDB, and Supabase.

🚀 **Live Demo:** https://69ecd9b94039c56996316b49--eclectic-dasik-f5529f.netlify.app/

---

## 💡 Why I Built This

Most developers use GitHub every day but rarely understand what goes on under the hood.
I challenged myself to rebuild core GitHub features from scratch — handling auth, file storage, real-time updates, and a full REST API — all deployed on production infrastructure.

---




## ✨ Key Features & What They Demonstrate

| Feature                                                           What It Shows |
|---|---|
| JWT Authentication (Signup/Login) | Secure auth flow, password hashing with bcryptjs, token storage |
| Follow / Unfollow Users | REST API design, MongoDB `$push` / `$pull` operators |
| Repository Management | Full CRUD operations with MongoDB |
| File Tree Viewer | Third-party API integration (Supabase storage) |
| Protected Routes | Frontend auth guards with React Router |
| Real-time updates | Socket.IO integration |
| Fully Deployed | Frontend on Netlify, Backend on Railway, DB on MongoDB Atlas |

---

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite** — fast, modern build tool
- **React Router** — client-side routing & protected routes
- **Axios** — API calls with error handling
- **Supabase JS** — file storage client

### Backend
- **Node.js + Express** — REST API server
- **MongoDB** (Native Driver) — database with manual query control
- **JWT + bcryptjs** — stateless auth & secure password storage
- **Socket.IO** — real-time communication
- **CORS** configured for cross-origin requests

### DevOps / Deployment
- **Netlify** — frontend CI/CD from GitHub
- **Railway** — backend hosting with env variable management
- **MongoDB Atlas** — cloud database
- **Supabase** — file/blob storage

---

## 🏗 System Architecture


User Browser
     │
     ▼
 Netlify (React Frontend)
     │  REST API calls (Axios)
     ▼
 Railway (Express Backend)
     │                    │
     ▼                    ▼
MongoDB Atlas        Supabase Storage
(Users, Repos)       (File Trees)


---

## 🔐 Authentication Flow

`
1. User submits email + password
2. Backend hashes password with bcryptjs (salt rounds: 10)
3. JWT token signed with secret key (expires in 1hr)
4. Token stored in localStorage
5. Protected routes check token on every navigation




## 📡 REST API Reference

### Auth Routes
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/signup` | Register new user | ❌ |
| POST | `/login` | Login, returns JWT | ❌ |

### User Routes
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/users` | Get all users | ✅ |
| GET | `/users/:id` | Get user by ID | ✅ |
| PUT | `/users/:id` | Update profile | ✅ |
| DELETE | `/users/:id` | Delete account | ✅ |
| POST | `/users/:id/follow` | Follow/Unfollow | ✅ |



## ⚙️ Run Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Supabase account

### Backend Setup

cd backend
npm install


Create `backend/.env`:

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_secret_key
PORT=3000

node index.js start

### Frontend Setup

cd frontend
npm install

Create `frontend/.env`:

VITE_API_URL=https://your-backend.up.railway.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

npm run dev

---

## 🧠 Challenges & What I Learned

- **Environment variables in Vite** — unlike Node.js, Vite uses `import.meta.env` and requires the `VITE_` prefix for browser-exposed variables

- **MongoDB native driver vs Mongoose** — used native driver for direct query control, giving deeper understanding of MongoDB operations

- **Full deployment pipeline** — configured separate deployments for frontend (Netlify) and backend (Railway) with proper env vars on each platform

- **JWT stateless auth** — implemented token-based auth without sessions, understanding the tradeoffs of localStorage vs cookies

---

## 🚀 Future Improvements

- [ ] Add GitHub OAuth login
- [ ] Implement actual git diff viewer
- [ ] Dark/Light mode toggle
- [ ] Paginate user and repo lists

---

## 👩‍💻 Author

**Anusha K**
- 📧 anushaakivadi1@gmail.com
- 🐙 GitHub: [@aak191](https://github.com/aak191)

---

