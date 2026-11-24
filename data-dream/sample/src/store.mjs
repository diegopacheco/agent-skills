export function createStore() {
  const users = [];
  const orders = [];

  function addUser({ name, email }) {
    if (!name || !email) {
      throw new ValidationError("name and email are required");
    }
    const clean = name.trim();
    if (users.some((u) => u.email === email)) {
      throw new ValidationError("email already registered");
    }
    const user = { id: users.length + 1, name: clean, email };
    users.push(user);
    return user;
  }

  function searchUsers(q) {
    const pattern = new RegExp(q, "iu");
    return users.filter((u) => pattern.test(u.name));
  }

  function addOrder({ userId, price, qty, createdAt }) {
    if (!users.some((u) => u.id === userId)) {
      throw new ValidationError("unknown user");
    }
    if (typeof price !== "number" || !Number.isInteger(qty) || qty < 1) {
      throw new ValidationError("price must be a number and qty a positive integer");
    }
    const total = Number((price * qty).toFixed(2));
    const order = { id: orders.length + 1, userId, price, qty, total, createdAt };
    orders.push(order);
    return order;
  }

  function dailyRevenue(day) {
    return orders.filter((o) => o.createdAt.slice(0, 10) === day).reduce((sum, o) => sum + o.total, 0);
  }

  return { addUser, searchUsers, addOrder, dailyRevenue };
}

export class ValidationError extends Error {}
