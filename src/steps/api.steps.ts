import { createBdd } from 'playwright-bdd';
import { expect, APIResponse } from '@playwright/test';
import { test } from '../fixtures/test.fixtures.js';
import { ApiClient } from '../api/ApiClient.js';

const { Given, When, Then } = createBdd(test);

/**
 * The last API response is stored here for the Then-steps to assert against.
 * playwright-bdd runs each scenario in its own worker/context, so a module
 * level variable is safe enough for this demonstration; a fixture-based
 * state object is the next step for larger suites.
 */
let lastResponse: APIResponse;

// ---------- GIVEN ----------

Given('the API base URL is configured', async ({ apiClient }) => {
  // Sanity check that the client was built from real configuration.
  expect(apiClient).toBeInstanceOf(ApiClient);
});

// ---------- WHEN ----------

When('I send a POST login request with valid API credentials', async ({ apiClient, testData }) => {
  lastResponse = await apiClient.post('/api/login', testData.apiLogin);
});

When('I send a POST login request with valid credentials', async ({ apiClient, testData }) => {
  lastResponse = await apiClient.post('/api/login', testData.apiLogin);
});

When('I send a POST login request with email {string} but no password', async ({ apiClient }, email: string) => {
  lastResponse = await apiClient.post('/api/login', { email });
});

When(
  'I send a POST login request with email {string} and password {string}',
  async ({ apiClient }, email: string, password: string) => {
    lastResponse = await apiClient.post('/api/login', { email, password });
  },
);

When('I request the user with id {int}', async ({ apiClient }, id: number) => {
  lastResponse = await apiClient.get(`/api/users/${id}`);
});

When(
  'I create a user with name {string} and job {string}',
  async ({ apiClient }, name: string, job: string) => {
    lastResponse = await apiClient.post('/api/users', { name, job });
  },
);

When(
  'I update the user with id {int} with name {string} and job {string}',
  async ({ apiClient }, id: number, name: string, job: string) => {
    lastResponse = await apiClient.put(`/api/users/${id}`, { name, job });
  },
);

When('I delete the user with id {int}', async ({ apiClient }, id: number) => {
  lastResponse = await apiClient.delete(`/api/users/${id}`);
});

When('I request page {int} of the users list', async ({ apiClient }, page: number) => {
  lastResponse = await apiClient.get('/api/users', { params: { page } });
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