import { APIRequestContext, APIResponse, expect } from '@playwright/test';

/**
 * ApiClient - thin, reusable wrapper over Playwright's APIRequestContext.
 *
 * Playwright's request context gives us real HTTP calls, automatic JSON
 * handling, and full integration with the HTML report / traces - no need
 * for an extra HTTP library.
 */
export class ApiClient {
  private readonly request: APIRequestContext;
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private token: string | undefined;

  constructor(request: APIRequestContext, baseUrl: string, apiKey = '') {
    this.request = request;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (apiKey) {
      this.defaultHeaders['x-api-key'] = apiKey;
    }
  }

  /** Store a bearer token used automatically on subsequent calls. */
  setToken(token: string): void {
    this.token = token;
  }

  getToken(): string | undefined {
    return this.token;
  }

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...extra };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private url(path: string): string {
    return path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  // ----- Generic verbs -----
  async get(path: string, options: { params?: Record<string, string | number>; headers?: Record<string, string> } = {}): Promise<APIResponse> {
    return this.request.get(this.url(path), { headers: this.headers(options.headers), params: options.params });
  }

  async post(path: string, data?: unknown, headers: Record<string, string> = {}): Promise<APIResponse> {
    return this.request.post(this.url(path), { headers: this.headers(headers), data: data as object });
  }

  async put(path: string, data?: unknown, headers: Record<string, string> = {}): Promise<APIResponse> {
    return this.request.put(this.url(path), { headers: this.headers(headers), data: data as object });
  }

  async patch(path: string, data?: unknown, headers: Record<string, string> = {}): Promise<APIResponse> {
    return this.request.patch(this.url(path), { headers: this.headers(headers), data: data as object });
  }

  async delete(path: string, headers: Record<string, string> = {}): Promise<APIResponse> {
    return this.request.delete(this.url(path), { headers: this.headers(headers) });
  }

  // ----- Assertion helpers -----
  static async expectStatus(response: APIResponse, status: number): Promise<void> {
    expect(response.status(), `Unexpected status for ${response.url()}`).toBe(status);
  }

  static async expectJson(response: APIResponse): Promise<Record<string, unknown>> {
    const contentType = response.headers()['content-type'] ?? '';
    expect(contentType).toContain('application/json');
    return (await response.json()) as Record<string, unknown>;
  }
}