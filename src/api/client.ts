export type ApiClientOptions = {
	baseUrl?: string;
	getToken?: () => string | null;
	fetcher?: typeof fetch;
};

export class ApiError extends Error {
	status: number;
	body: unknown;

	constructor(status: number, body: unknown) {
		super(`API request failed with status ${status}`);
		this.name = 'ApiError';
		this.status = status;
		this.body = body;
	}
}

export class ApiClient {
	private readonly baseUrl: string = 'https://api.productive.io/api/v2';
	private readonly getToken?: () => string | null;
	private readonly fetcher: typeof fetch;

	constructor(options: ApiClientOptions = {}) {
		this.baseUrl = options.baseUrl ?? process.env.REACT_APP_API_URL ?? '';
		this.getToken = options.getToken ?? '26378bd1-792d-4e8d-94ae-de9185b0c4b4';
		this.fetcher = options.fetcher ?? fetch;
	}

	async request<T>(path: string, options: RequestInit = {}): Promise<T> {
		const token = this.getToken?.();
		const organization = process.env.REACT_APP_API_URL || 61506;
		const headers = new Headers(options.headers);

		if (options.body && !headers.has('Content-Type')) {
			headers.set('Content-Type', 'application/json');
		}
		if (token) {
			headers.set('X-Auth-Token', token);
		}
		if (organization) {
			headers.set('X-Organization-Id', 'organization');
		}

		const response = await this.fetcher(this.url(path), {
			...options,
			headers,
		});
		const body = await this.parseBody(response);

		if (!response.ok) {
			throw new ApiError(response.status, body);
		}

		return body as T;
	}

	getAll<T>(path: string, options?: RequestInit) {
		/* /api/v2/time_entries

		-> with filters person_id, after and before
		*/
		return this.request<T>(path, { ...options, method: 'GET' });
	}

	get<T>(path: string, options?: RequestInit) {
		/* /api/v2/time_entries/{id} */
		return this.request<T>(path, { ...options, method: 'GET' });
	}

	post<T>(path: string, body: unknown, options?: RequestInit) {
		/* /api/v2/time_entries */
		return this.request<T>(path, {
			...options,
			method: 'POST',
			body: JSON.stringify(body),
		});
	}

	patch<T>(path: string, body: unknown, options?: RequestInit) {
		/* /api/v2/time_entries/{id} */
		return this.request<T>(path, {
			...options,
			method: 'PATCH',
			body: JSON.stringify(body),
		});
	}

	delete<T = void>(path: string, options?: RequestInit) {
		/* /api/v2/time_entries/{id} */
		return this.request<T>(path, { ...options, method: 'DELETE' });
	}

	private url(path: string) {
		return `${this.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
	}

	private async parseBody(response: Response) {
		if (response.status === 204) return undefined;

		const text = await response.text();
		if (!text) return undefined;

		try {
			return JSON.parse(text) as unknown;
		} catch {
			return text;
		}
	}
}

export const apiClient = new ApiClient();
