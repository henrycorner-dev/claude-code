/**
 * Example E2E tests using Playwright
 * Tests complete user workflows through the browser
 */

import { test, expect, Page } from '@playwright/test';

// Helper function to login (reusable across tests)
async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/dashboard');
}

test.describe('User Authentication Flow', () => {
  test('user can sign up with valid credentials', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');

    // Fill out signup form
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password').fill('SecurePassword123!');
    await page.getByLabel('Confirm Password').fill('SecurePassword123!');

    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Verify welcome message
    await expect(page.getByText('Welcome, Test User!')).toBeVisible();
  });

  test('user can login with existing credentials', async ({ page }) => {
    await page.goto('/login');

    // Enter credentials
    await page.getByLabel('Email').fill('existing@example.com');
    await page.getByLabel('Password').fill('password123');

    // Click login button
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Verify successful login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Welcome back!')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Enter wrong credentials
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Verify error message
    await expect(page.getByText('Invalid email or password')).toBeVisible();

    // Verify still on login page
    await expect(page).toHaveURL('/login');
  });

  test('user can logout', async ({ page }) => {
    // Login first
    await login(page, 'user@example.com', 'password123');

    // Click logout
    await page.getByRole('button', { name: 'Logout' }).click();

    // Verify redirect to home
    await expect(page).toHaveURL('/');
  });
});

test.describe('E-commerce Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page, 'user@example.com', 'password123');
  });

  test('user can complete full checkout process', async ({ page }) => {
    // Browse products
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

    // Add item to cart
    const firstProduct = page.locator('.product-card').first();
    await firstProduct.getByRole('button', { name: 'Add to Cart' }).click();

    // Verify cart badge updates
    await expect(page.getByTestId('cart-count')).toHaveText('1');

    // Go to cart
    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page).toHaveURL('/cart');

    // Verify item in cart
    await expect(page.locator('.cart-item')).toHaveCount(1);

    // Proceed to checkout
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await expect(page).toHaveURL('/checkout');

    // Fill shipping information
    await page.getByLabel('Street Address').fill('123 Main St');
    await page.getByLabel('City').fill('San Francisco');
    await page.getByLabel('State').selectOption('CA');
    await page.getByLabel('Zip Code').fill('94102');

    // Continue to payment
    await page.getByRole('button', { name: 'Continue to Payment' }).click();

    // Fill payment information
    await page.getByLabel('Card Number').fill('4242424242424242');
    await page.getByLabel('Expiry Date').fill('12/25');
    await page.getByLabel('CVV').fill('123');

    // Place order
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Wait for order confirmation
    await expect(page).toHaveURL(/\/orders\/[a-z0-9-]+/);
    await expect(page.getByRole('heading', { name: 'Order Confirmed!' })).toBeVisible();

    // Verify order details
    await expect(page.getByText('Order Number:')).toBeVisible();
    await expect(page.getByText('Total:')).toBeVisible();
  });

  test('cart persists across page navigation', async ({ page }) => {
    // Add items to cart
    await page.goto('/products');
    await page
      .locator('.product-card')
      .first()
      .getByRole('button', { name: 'Add to Cart' })
      .click();
    await page.locator('.product-card').nth(1).getByRole('button', { name: 'Add to Cart' }).click();

    // Navigate away
    await page.goto('/dashboard');

    // Navigate to cart
    await page.goto('/cart');

    // Verify items still in cart
    await expect(page.locator('.cart-item')).toHaveCount(2);
  });

  test('can update item quantity in cart', async ({ page }) => {
    // Add item to cart
    await page.goto('/products');
    await page
      .locator('.product-card')
      .first()
      .getByRole('button', { name: 'Add to Cart' })
      .click();

    // Go to cart
    await page.goto('/cart');

    // Increase quantity
    const quantityInput = page.getByLabel('Quantity');
    await quantityInput.fill('3');

    // Verify total updates
    const initialTotal = await page.getByTestId('cart-total').textContent();
    await expect(page.getByTestId('cart-total')).not.toHaveText(initialTotal!);
  });

  test('can remove item from cart', async ({ page }) => {
    // Add items
    await page.goto('/products');
    await page
      .locator('.product-card')
      .first()
      .getByRole('button', { name: 'Add to Cart' })
      .click();
    await page.locator('.product-card').nth(1).getByRole('button', { name: 'Add to Cart' }).click();

    // Go to cart
    await page.goto('/cart');
    await expect(page.locator('.cart-item')).toHaveCount(2);

    // Remove first item
    await page.locator('.cart-item').first().getByRole('button', { name: 'Remove' }).click();

    // Verify item removed
    await expect(page.locator('.cart-item')).toHaveCount(1);
  });

  test('shows validation errors for incomplete checkout', async ({ page }) => {
    // Add item and go to checkout
    await page.goto('/products');
    await page
      .locator('.product-card')
      .first()
      .getByRole('button', { name: 'Add to Cart' })
      .click();
    await page.goto('/cart');
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();

    // Try to continue without filling shipping
    await page.getByRole('button', { name: 'Continue to Payment' }).click();

    // Verify validation errors
    await expect(page.getByText('Street Address is required')).toBeVisible();
    await expect(page.getByText('City is required')).toBeVisible();
    await expect(page.getByText('Zip Code is required')).toBeVisible();
  });
});

test.describe('Search and Filtering', () => {
  test('can search for products', async ({ page }) => {
    await page.goto('/products');

    // Use search
    await page.getByPlaceholder('Search products...').fill('laptop');
    await page.keyboard.press('Enter');

    // Verify search results
    await expect(page).toHaveURL(/\/products\?search=laptop/);
    await expect(page.locator('.product-card')).toHaveCount(3);

    // Verify all results contain search term
    const productTitles = await page.locator('.product-card h3').allTextContents();
    productTitles.forEach(title => {
      expect(title.toLowerCase()).toContain('laptop');
    });
  });

  test('can filter products by category', async ({ page }) => {
    await page.goto('/products');

    // Select category filter
    await page.getByLabel('Category').selectOption('Electronics');

    // Verify filtered results
    await expect(page).toHaveURL(/\/products\?category=electronics/);
    await expect(page.locator('.product-card')).toBeGreaterThan(0);
  });

  test('shows no results message when search has no matches', async ({ page }) => {
    await page.goto('/products');

    // Search for non-existent product
    await page.getByPlaceholder('Search products...').fill('zzz-nonexistent-xyz');
    await page.keyboard.press('Enter');

    // Verify no results message
    await expect(page.getByText('No products found')).toBeVisible();
    await expect(page.locator('.product-card')).toHaveCount(0);
  });
});

test.describe('Responsive Design', () => {
  test('mobile navigation works correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Open mobile menu
    await page.getByRole('button', { name: 'Menu' }).click();

    // Verify menu items visible
    await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();

    // Navigate via mobile menu
    await page.getByRole('link', { name: 'Products' }).click();
    await expect(page).toHaveURL('/products');
  });
});

test.describe('Error Handling', () => {
  test('shows 404 page for non-existent routes', async ({ page }) => {
    await page.goto('/non-existent-page');

    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
    await expect(page.getByText('Page not found')).toBeVisible();
  });

  test('handles network errors gracefully', async ({ page }) => {
    // Simulate offline
    await page.context().setOffline(true);

    await page.goto('/products');

    // Verify error message
    await expect(
      page.getByText('Failed to load products. Please check your connection.')
    ).toBeVisible();
  });
});
