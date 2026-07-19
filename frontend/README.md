# 🎨 Frontend - Smart Complaint Escalation System

This is the **React.js frontend** for the Smart Complaint Escalation System.

---

## 📁 Folder Structure Explained

```
frontend/
├── public/
│   └── index.html         ← The single HTML file React uses
│
└── src/
    ├── index.js            ← ENTRY POINT: Renders App into HTML
    ├── App.js              ← MAIN COMPONENT: Sets up routing
    ├── App.css             ← ALL STYLES for the entire app
    │
    ├── context/
    │   └── AuthContext.js  ← AUTHENTICATION STATE MANAGEMENT
    │                         Provides: user, login, register, logout
    │
    ├── components/         ← REUSABLE UI PIECES
    │   ├── Navbar.js       ← Top navigation bar
    │   ├── PrivateRoute.js ← Protects routes requiring login
    │   ├── ComplaintCard.js← Card to display a single complaint
    │   └── StatusBadge.js  ← Colored status indicator
    │
    ├── pages/              ← FULL PAGE COMPONENTS
    │   ├── Login.js           ← Login form
    │   ├── Register.js        ← Registration form
    │   ├── Dashboard.js       ← Citizen home page
    │   ├── RegisterComplaint.js ← New complaint form
    │   ├── TrackComplaint.js  ← List/filter citizen's complaints
    │   ├── ComplaintDetails.js← Full complaint view + status update
    │   ├── AdminDashboard.js  ← Admin stats & management
    │   ├── OfficerDashboard.js← Officer complaint management
    │   └── PublicDashboard.js ← Public transparency stats
    │
    └── utils/
        └── api.js          ← AXIOS CONFIGURATION
                              Auto-attaches JWT token to requests
```

---

## 🧠 How React Works (For Beginners)

### Components
React apps are built with **components** - reusable pieces of UI.
Each `.js` file in `components/` and `pages/` is a component.

```
App.js
 ├── Navbar (always visible)
 └── Routes
      ├── Login page
      ├── Dashboard page
      │    ├── ComplaintCard
      │    └── ComplaintCard
      └── etc.
```

### State (useState)
State is data that can change over time. When state changes, React re-renders the component.

```javascript
const [name, setName] = useState('');  // '' is initial value
setName('John');  // This updates the state and re-renders
```

### Effects (useEffect)
Effects run code when a component loads or when data changes.

```javascript
useEffect(() => {
  // This runs ONCE when the component first appears
  fetchData();
}, []);  // Empty array = run only once
```

### Context (useContext)
Context shares data across ALL components without passing props.

```javascript
// In any component:
const { user, login, logout } = useAuth();
// Now you can access user data anywhere!
```

---

## 🛣️ Routing (React Router)

React Router makes the app behave like a multi-page website,
but it's actually a Single Page Application (SPA).

| URL | Component | Access |
|-----|-----------|--------|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/public-dashboard` | PublicDashboard | Public |
| `/dashboard` | Dashboard | Citizen only |
| `/register-complaint` | RegisterComplaint | Citizen only |
| `/track-complaints` | TrackComplaint | Citizen only |
| `/complaints/:id` | ComplaintDetails | Any logged-in user |
| `/admin-dashboard` | AdminDashboard | Admin only |
| `/officer-dashboard` | OfficerDashboard | Officer only |

### How PrivateRoute Works
```
User visits /admin-dashboard
        │
        ▼
PrivateRoute checks: Is user logged in?
        │
    ┌───┴───┐
    │ NO    │ YES
    ▼       ▼
Redirect   Check role: Is user admin?
to /login        │
            ┌────┴────┐
            │ NO      │ YES
            ▼         ▼
          Redirect   Show AdminDashboard
          to /dashboard
```

---

## 🔐 Authentication Flow

```
1. User fills login form → calls login() from AuthContext
2. AuthContext sends POST /api/auth/login to backend
3. Backend verifies credentials → returns JWT token
4. AuthContext stores token in localStorage
5. AuthContext sets user state → app re-renders with user data
6. Navbar shows user-specific links
7. Every API call includes token via Axios interceptor
8. On logout → clear localStorage → redirect to /login
```

---

## 📡 API Calls (Axios)

The `api.js` utility creates an Axios instance that:
1. Always uses `http://localhost:5000/api` as base URL
2. Automatically attaches JWT token to every request
3. Handles 401 errors (expired token → redirect to login)

```javascript
// Example usage in a component:
import api from '../utils/api';

// GET request
const response = await api.get('/complaints/my');

// POST request with data
await api.post('/complaints', formData);

// PUT request
await api.put(`/complaints/${id}/status`, { status: 'Resolved' });
```

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app runs at `http://localhost:3000` and proxies API requests to `http://localhost:5000`.

---

## 📝 Key Concepts for Beginners

### JSX
React uses JSX - HTML-like syntax inside JavaScript:
```jsx
return (
  <div className="card">
    <h1>{title}</h1>        {/* Variables in {} */}
    <p>{isActive ? 'Yes' : 'No'}</p>  {/* Conditions */}
    {items.map(item => (     /* Loops */
      <li key={item.id}>{item.name}</li>
    ))}
  </div>
);
```

### Props
Data passed from parent to child component:
```jsx
// Parent passes data
<ComplaintCard complaint={myComplaint} />

// Child receives it
const ComplaintCard = ({ complaint }) => {
  return <h3>{complaint.title}</h3>;
};
```

### Event Handling
```jsx
<button onClick={handleClick}>Click Me</button>
<input onChange={(e) => setName(e.target.value)} />
<form onSubmit={handleSubmit}>...</form>
```
