/**
 * Example unit tests demonstrating best practices
 * Tests pure functions and business logic in isolation
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Example functions to test
function calculateTotal(items: { price: number }[], discount = 0): number {
  if (!items || items.length === 0) return 0;
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal * (1 - discount);
}

function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

class ShoppingCart {
  private items: { id: string; price: number }[] = [];

  addItem(item: { id: string; price: number }) {
    this.items.push(item);
  }

  removeItem(itemId: string) {
    this.items = this.items.filter(item => item.id !== itemId);
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }

  getItemCount(): number {
    return this.items.length;
  }

  clear() {
    this.items = [];
  }
}

// Unit Tests
describe('calculateTotal', () => {
  it('should sum item prices correctly', () => {
    const items = [{ price: 10 }, { price: 20 }, { price: 30 }];
    expect(calculateTotal(items)).toBe(60);
  });

  it('should handle empty cart', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('should handle null or undefined', () => {
    expect(calculateTotal(null as any)).toBe(0);
    expect(calculateTotal(undefined as any)).toBe(0);
  });

  it('should apply discount when provided', () => {
    const items = [{ price: 100 }];
    expect(calculateTotal(items, 0.1)).toBe(90);
  });

  it('should handle 100% discount', () => {
    const items = [{ price: 100 }];
    expect(calculateTotal(items, 1)).toBe(0);
  });

  it('should handle decimal prices', () => {
    const items = [{ price: 10.99 }, { price: 20.5 }];
    expect(calculateTotal(items)).toBeCloseTo(31.49, 2);
  });
});

describe('validateEmail', () => {
  it('should validate correct email format', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.user@domain.co.uk')).toBe(true);
    expect(validateEmail('user+tag@example.com')).toBe(true);
  });

  it('should reject invalid email format', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('user @example.com')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail(null as any)).toBe(false);
    expect(validateEmail(undefined as any)).toBe(false);
  });
});

describe('ShoppingCart', () => {
  let cart: ShoppingCart;

  beforeEach(() => {
    cart = new ShoppingCart();
  });

  describe('addItem', () => {
    it('should add item to cart', () => {
      cart.addItem({ id: '1', price: 10 });
      expect(cart.getItemCount()).toBe(1);
    });

    it('should increase total when adding items', () => {
      cart.addItem({ id: '1', price: 10 });
      cart.addItem({ id: '2', price: 20 });
      expect(cart.getTotal()).toBe(30);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      cart.addItem({ id: '1', price: 10 });
      cart.addItem({ id: '2', price: 20 });
      cart.removeItem('1');
      expect(cart.getItemCount()).toBe(1);
      expect(cart.getTotal()).toBe(20);
    });

    it('should handle removing non-existent item', () => {
      cart.addItem({ id: '1', price: 10 });
      cart.removeItem('999');
      expect(cart.getItemCount()).toBe(1);
    });
  });

  describe('clear', () => {
    it('should remove all items', () => {
      cart.addItem({ id: '1', price: 10 });
      cart.addItem({ id: '2', price: 20 });
      cart.clear();
      expect(cart.getItemCount()).toBe(0);
      expect(cart.getTotal()).toBe(0);
    });
  });

  describe('getTotal', () => {
    it('should return 0 for empty cart', () => {
      expect(cart.getTotal()).toBe(0);
    });

    it('should calculate total correctly', () => {
      cart.addItem({ id: '1', price: 15.99 });
      cart.addItem({ id: '2', price: 24.5 });
      expect(cart.getTotal()).toBeCloseTo(40.49, 2);
    });
  });
});
