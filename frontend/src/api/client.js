const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function handleResponse(res) {
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.error) errorMessage = data.error;
      else if (data.errors && Array.isArray(data.errors)) errorMessage = data.errors.join(', ');
    } catch {
      // response wasn't JSON
    }
    throw new Error(errorMessage);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  async getExpenses() {
    const res = await fetch(`${API_BASE}/expenses`);
    return handleResponse(res);
  },

  async createExpense({ description, amount, paidBy, splitBetween }) {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        amount: Number(amount),
        paidBy,
        splitBetween,
      }),
    });
    return handleResponse(res);
  },

  async deleteExpense(id) {
    const res = await fetch(`${API_BASE}/expenses/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async getBalances() {
    const res = await fetch(`${API_BASE}/balances`);
    return handleResponse(res);
  },

  async getPeople() {
    const res = await fetch(`${API_BASE}/people`);
    return handleResponse(res);
  },
};
