import { expect, APIResponse } from '@playwright/test';
import { Given, When, Then } from '../Routine/GenericFunction.js';

/**
 * API steps use Playwright's built-in `request` fixture.
 * The base URL comes from the "api" project in playwright.config.ts.
 */
let lastResponse: APIResponse;

// ---------- GIVEN ----------

Given('the API base URL is configured', async ({ baseURL }) => {
  expect(baseURL).toBeTruthy();
});

// ---------- WHEN ----------

When('I send a POST login request with email {string} but no password', async ({ request }, email: string) => {
  lastResponse = await request.post('/api/login', { data: { email } });
});

When(
  'I send a POST login request with email {string} and password {string}',
  async ({ request }, email: string, password: string) => {
    lastResponse = await request.post('/api/login', { data: { email, password } });
  },
);

When('I request the user with id {int}', async ({ request }, id: number) => {
  lastResponse = await request.get(`/api/users/${id}`);
});

When(
  'I create a user with name {string} and job {string}',
  async ({ request }, name: string, job: string) => {
    lastResponse = await request.post('/api/users', { data: { name, job } });
  },
);

When(
  'I update the user with id {int} with name {string} and job {string}',
  async ({ request }, id: number, name: string, job: string) => {
    lastResponse = await request.put(`/api/users/${id}`, { data: { name, job } });
  },
);

When('I delete the user with id {int}', async ({ request }, id: number) => {
  lastResponse = await request.delete(`/api/users/${id}`);
});

When('I request page {int} of the users list', async ({ request }, page: number) => {
  lastResponse = await request.get('/api/users', { params: { page } });
});

// ---------- THEN ----------

Then('the API response status should be {int}', async ({}, status: number) => {
  expect(lastResponse.status(), `Unexpected status from ${lastResponse.url()}`).toBe(status);
});

Then('the API response should contain a token', async ({}) => {
  const body = await lastResponse.json();
  expect(body).toHaveProperty('token');
  expect(typeof body.token).toBe('string');
  expect(body.token.length).toBeGreaterThan(0);
});

Then('the API error message should be {string}', async ({}, expected: string) => {
  const body = await lastResponse.json();
  expect(body.error).toBe(expected);
});

Then('the API response should contain user details', async ({}) => {
  const body = await lastResponse.json();
  expect(body).toHaveProperty('data');
  expect(body.data).toHaveProperty('id');
  expect(body.data).toHaveProperty('email');
  expect(body.data.email).toContain('@');
});

Then('the API response should contain the created user details', async ({}) => {
  const body = await lastResponse.json();
  expect(body).toHaveProperty('id');
  expect(body).toHaveProperty('name');
  expect(body).toHaveProperty('job');
  expect(body).toHaveProperty('createdAt');
});

Then('the API response should contain the updated name {string}', async ({}, name: string) => {
  const body = await lastResponse.json();
  expect(body.name).toBe(name);
  expect(body).toHaveProperty('updatedAt');
});

Then('the API response should contain a paginated list', async ({}) => {
  const body = await lastResponse.json();
  expect(body).toHaveProperty('page');
  expect(body).toHaveProperty('per_page');
  expect(body).toHaveProperty('total');
  expect(Array.isArray(body.data)).toBe(true);
  expect(body.data.length).toBeGreaterThan(0);
});