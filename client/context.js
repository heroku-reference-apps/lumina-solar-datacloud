import { SalesforceDataCloud } from './integration/salesforce-datacloud.js';

// The default export function runs exactly once on
// the server and once on the client during the
// first render, that is, it's not executed again
// in subsquent client-side navigation via React Router.
export default async (ctx) => {
  if (ctx.server) {
    // Do server stuff here
  } else {
    // Start the Salesforce Data Cloud integration on the client
    await ctx.actions.getProfile(ctx.state);
    await SalesforceDataCloud.init({ user: ctx.state.user });
  }
};

// State initializer, must be a function called state
// as this is a special context.js export and has
// special processing, e.g., serialization and hydration
export function state() {
  return {
    user: null,
    systems: [],
    metricsSummary: null,
    products: [],
    product: null,
    cart: [],
    notifications: [],
  };
}

// Grouped actions that operate on the state. This export
// could be named anything, no special processing involved.
export const actions = {
  async authenticate(state, credentials) {
    const response = await fetch('/api/user/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
    const { user } = await response.json();
    state.user = { ...state.user, ...user };
  },
  async logout(state) {
    // Reset state
    state.user = null;
    state.systems = [];
    state.metricsSummary = null;
    state.products = [];
    state.product = null;
    state.cart = [];
    await fetch('/api/user/logout');
  },
  async getProfile(state) {
    const response = await fetch('/api/user/profile');
    if (response.ok) {
      state.user = await response.json();
    }
  },
  async getSystemsByUser(state) {
    const response = await fetch('/api/systems');
    if (response.ok) {
      state.systems = await response.json();
    }
  },
  async getMetricsBySystem(state, systemId, date) {
    const response = await fetch(`/api/metrics/${systemId}?date=${date}`);
    if (response.ok) {
      state.metrics = await response.json();
    }
  },
  async getMetricsSummaryBySystem(state, systemId, date) {
    const response = await fetch(`/api/summary/${systemId}?date=${date}`);
    if (response.ok) {
      state.metricsSummary = await response.json();
    }
  },
  async getProducts(state) {
    const response = await fetch('/api/products');
    if (response.ok) {
      state.products = await response.json();
    }
  },
  async getProductById(state, productId) {
    const response = await fetch(`/api/products/${productId}`);
    if (response.ok) {
      state.product = await response.json();
    }
  },
  async addToCart(state, product) {
    let productExists = false;

    state.cart = state.cart.map((p) => {
      if (p.id === product.id) {
        productExists = true;
        return { ...p, quantity: p.quantity + 1 };
      }
      return p;
    });

    if (!productExists) {
      state.cart.push({ ...product, quantity: 1 });
    }
  },
  async removeFromCart(state, product) {
    state.cart = state.cart.reduce((newCart, p) => {
      if (p.id === product.id) {
        if (p.quantity > 1) {
          newCart.push({ ...p, quantity: p.quantity - 1 });
        }
      } else {
        newCart.push(p);
      }
      return newCart;
    }, []);
  },
  async getNotifications(state) {
    const response = await fetch('/api/notifications');
    if (response.ok) {
      state.notifications = await response.json();
    }
  },
};
