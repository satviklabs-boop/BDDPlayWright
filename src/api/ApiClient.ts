/**
 * ApiClient - a small wrapper over Playwright's request context.
 *
 * Playwright's `request` already does real HTTP calls, JSON handling and
 * report integration, so we only add the base URL and auth headers.
 */
import { APIRequestContext, APIResponse, expect } from '@playwright/test';

export class ApiClient {
  private token: string | undefined;

  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string,
  ) {}

  /** Send this token as `Authorization: Bearer ...` on later calls. */
  setToken(token: string) {
    this.token = token;
  }

  private url(path: string): string {
    return path.startsWith('http') ? path : this.baseUrl + path;
  }

  private headers(extra: Record<string, string> = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...extra,
    };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    return headers;
  }

  async get(path: string, params?: Record<string, string | number | boolean>) {
    return this.request.get(this.url(path), { headers: this.headers(), params });
  }

  async post(path: string, data?: unknown) {
    return this.request.post(this.url(path), { headers: this.headers(), data: data as object });
  }

  async put(path: string, data?: unknown) {
    return this.request.put(this.url(path), { headers: this.headers(), data: data as object });
  }

  async delete(path: string) {
    return this.request.delete(this.url(path), { headers: this.headers() });
  }

  // ----- Assertion helpers -----
  static expectStatus(response: APIResponse, status: number) {
    expect(response.status(), `Unexpected status for ${response.url()}`).toBe(status);
  }

  static async expectJson(response: APIResponse): Promise<Record<string, unknown>> {
    expect(response.headers()['content-type']).toContain('application/json');
    return (await response.json()) as Record<string, unknown>;
  }
}