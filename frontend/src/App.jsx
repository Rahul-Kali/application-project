import { useMemo, useState } from "react";

const orderApiUrl = import.meta.env.VITE_ORDER_API_URL || "/api/order";
const usersStorageKey = "microservices-demo-users";

const demoUsers = [
  {
    name: "Aarav Mehta",
    email: "aarav@example.com",
    password: "Aarav@123"
  },
  {
    name: "Maya Sharma",
    email: "maya@example.com",
    password: "Maya@123"
  },
  {
    name: "Rohan Patel",
    email: "rohan@example.com",
    password: "Rohan@123"
  }
];

const dbTables = [
  {
    name: "app_users",
    description: "Application user records seeded in PostgreSQL.",
    columns: ["id", "name", "email", "created_at"]
  },
  {
    name: "products",
    description: "Product catalog records used by the demo data.",
    columns: ["id", "name", "price", "stock"]
  },
  {
    name: "orders",
    description: "Sample orders connected to users and products.",
    columns: ["id", "user_id", "product_id", "quantity", "status", "created_at"]
  }
];

function getStoredUsers() {
  try {
    const storedUsers = JSON.parse(localStorage.getItem(usersStorageKey)) || [];
    const demoEmails = new Set(demoUsers.map((user) => user.email));
    return [
      ...demoUsers,
      ...storedUsers.filter((user) => !demoEmails.has(user.email))
    ];
  } catch {
    return demoUsers;
  }
}

function saveStoredUsers(users) {
  localStorage.setItem(usersStorageKey, JSON.stringify(users));
}

export default function App() {
  const [authMode, setAuthMode] = useState("login");
  const [activeView, setActiveView] = useState("database");
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pageTitle = useMemo(
    () => (authMode === "login" ? "Login" : "Create Account"),
    [authMode]
  );

  const updateCredential = (field, value) => {
    setCredentials((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleAuth = (event) => {
    event.preventDefault();
    setAuthError("");

    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password;
    const users = getStoredUsers();

    if (!email || !password || (authMode === "signup" && !credentials.name.trim())) {
      setAuthError("Please fill all required fields.");
      return;
    }

    if (authMode === "signup") {
      if (users.some((user) => user.email === email)) {
        setAuthError("An account already exists for this email.");
        return;
      }

      const newUser = {
        name: credentials.name.trim(),
        email,
        password
      };

      saveStoredUsers([...users, newUser]);
      setCurrentUser({ name: newUser.name, email: newUser.email });
      return;
    }

    const matchedUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (!matchedUser) {
      setAuthError("Invalid email or password.");
      return;
    }

    setCurrentUser({ name: matchedUser.name, email: matchedUser.email });
  };

  const placeOrder = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(orderApiUrl, {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("Order request failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (requestError) {
      setError(requestError.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <main className="app-shell">
        <section className="auth-panel">
          <div>
            <p className="eyebrow">Microservices DB Access</p>
            <h1>{pageTitle}</h1>
          </div>

          <form className="auth-form" onSubmit={handleAuth}>
            {authMode === "signup" && (
              <label>
                Name
                <input
                  value={credentials.name}
                  onChange={(event) => updateCredential("name", event.target.value)}
                  placeholder="Aarav Mehta"
                />
              </label>
            )}

            <label>
              Email
              <input
                type="email"
                value={credentials.email}
                onChange={(event) => updateCredential("email", event.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={credentials.password}
                onChange={(event) => updateCredential("password", event.target.value)}
                placeholder="Enter password"
              />
            </label>

            {authError && <p className="error">{authError}</p>}

            <button type="submit">
              {authMode === "login" ? "Login" : "Sign Up"}
            </button>
          </form>

          <button
            className="link-button"
            type="button"
            onClick={() => {
              setAuthError("");
              setAuthMode(authMode === "login" ? "signup" : "login");
            }}
          >
            {authMode === "login"
              ? "Need an account? Sign up"
              : "Already have an account? Login"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Microservices Workspace</p>
          <h1>Database Area</h1>
        </div>
        <div className="user-actions">
          <span>{currentUser.name}</span>
          <button type="button" onClick={() => setCurrentUser(null)}>
            Logout
          </button>
        </div>
      </header>

      <nav className="tabs" aria-label="Dashboard views">
        <button
          className={activeView === "database" ? "active" : ""}
          type="button"
          onClick={() => setActiveView("database")}
        >
          Database
        </button>
        <button
          className={activeView === "orders" ? "active" : ""}
          type="button"
          onClick={() => setActiveView("orders")}
        >
          Orders
        </button>
      </nav>

      {activeView === "database" ? (
        <section className="content-panel">
          <div className="panel-heading">
            <h2>PostgreSQL</h2>
            <span className="status-pill">Protected</span>
          </div>

          <dl className="connection-grid">
            <div>
              <dt>Host</dt>
              <dd>postgres</dd>
            </div>
            <div>
              <dt>Local Port</dt>
              <dd>5555</dd>
            </div>
            <div>
              <dt>Database</dt>
              <dd>microservices_db</dd>
            </div>
            <div>
              <dt>User</dt>
              <dd>microservices_user</dd>
            </div>
          </dl>

          <div className="table-list">
            {dbTables.map((table) => (
              <article className="table-card" key={table.name}>
                <h3>{table.name}</h3>
                <p>{table.description}</p>
                <div className="column-list">
                  {table.columns.map((column) => (
                    <span key={column}>{column}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="content-panel">
          <div className="panel-heading">
            <h2>Order Demo</h2>
          </div>
          <p>Click the button to place an order through the microservice flow.</p>
          <button type="button" onClick={placeOrder} disabled={loading}>
            {loading ? "Placing Order..." : "Place Order"}
          </button>

          {error && <p className="error">{error}</p>}

          {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
        </section>
      )}
    </main>
  );
}
