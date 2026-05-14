CREATE TABLE IF NOT EXISTS app_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  price NUMERIC(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES app_users(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'CREATED',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_users (name, email)
VALUES
  ('Aarav Mehta', 'aarav@example.com'),
  ('Maya Sharma', 'maya@example.com'),
  ('Rohan Patel', 'rohan@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO products (name, price, stock)
VALUES
  ('Wireless Keyboard', 2499.00, 25),
  ('USB-C Hub', 1799.00, 40),
  ('Noise Cancelling Headphones', 5999.00, 12)
ON CONFLICT DO NOTHING;

INSERT INTO orders (user_id, product_id, quantity, status)
SELECT u.id, p.id, 1, 'CREATED'
FROM app_users u
JOIN products p ON p.name = 'Wireless Keyboard'
WHERE u.email = 'aarav@example.com'
  AND NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.id
      AND o.product_id = p.id
      AND o.status = 'CREATED'
  );

INSERT INTO orders (user_id, product_id, quantity, status)
SELECT u.id, p.id, 2, 'PAID'
FROM app_users u
JOIN products p ON p.name = 'USB-C Hub'
WHERE u.email = 'maya@example.com'
  AND NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.id
      AND o.product_id = p.id
      AND o.status = 'PAID'
  );
