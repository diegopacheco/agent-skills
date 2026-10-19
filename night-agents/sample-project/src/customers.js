function findByEmail(db, email) {
  return db.prepare("SELECT * FROM customers WHERE email = ?").get(email) || null;
}

function register(db, name, email) {
  if (!name || !email || !email.includes("@")) throw new Error("name and a valid email are required");
  if (findByEmail(db, email)) throw new Error("email already registered");
  const { lastInsertRowid } = db.prepare("INSERT INTO customers (name, email) VALUES (?, ?)").run(name, email);
  return { id: Number(lastInsertRowid), name, email };
}

module.exports = { findByEmail, register };
