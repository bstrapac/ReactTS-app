import { Organization, OrganizationMembership, Person, User } from '../types';
const PRODUCTIVE_API_URL = process.env.NODE_ENV === 'development' ? '/api/v2' : 'https://api.productive.io/api/v2';

export type ApiClientOptions = {
	baseUrl?: string;
	token?: string | null;
	organizationId?: string | number | null;
	getToken?: () => string | null;
	fetcher?: typeof fetch;
};

export type TimeEntryFilters = {
	personId?: string | number;
	after?: string;
	before?: string;
	pageNumber?: number;
	pageSize?: number;
};

type CollectionResponse<T> = {
	data: T[];
};

type DocumentResponse<T> = {
	data: T;
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
	private readonly baseUrl: string;
	private readonly getToken?: () => string | null;
	private readonly fetcher: typeof fetch;
	private readonly organizationId?: string;

	constructor(options: ApiClientOptions = {}) {
		this.baseUrl = options.baseUrl ?? process.env.REACT_APP_API_URL ?? PRODUCTIVE_API_URL;
		this.getToken = options.getToken ?? (() => options.token ?? process.env.REACT_APP_API_TOKEN ?? null);
		const organizationId = options.organizationId ?? process.env.REACT_APP_ORGANIZATION_ID;
		this.organizationId = organizationId == null ? undefined : String(organizationId);
		this.fetcher = options.fetcher ?? fetch.bind(globalThis);
	}

	async request<T>(path: string, options: RequestInit = {}): Promise<T> {
		const token = this.getToken?.();
		const headers = new Headers(options.headers);
		const url = this.url(path);

		headers.set('Accept', 'application/vnd.api+json');
		if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/vnd.api+json');
		if (token) {
			headers.set('X-Auth-Token', token);
		}
		if (this.organizationId) {
			headers.set('X-Organization-Id', this.organizationId);
		}

		const response = await this.fetcher(url, {
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
		return this.request<T>(path, { ...options, method: 'GET' });
	}

	listTimeEntries<T>(filters: TimeEntryFilters = {}, options?: RequestInit) {
		const params = new URLSearchParams();
		if (filters.personId != null) params.set('filter[person_id]', String(filters.personId));
		if (filters.after) params.set('filter[after]', filters.after);
		if (filters.before) params.set('filter[before]', filters.before);
		if (filters.pageNumber != null) params.set('page[number]', String(filters.pageNumber));
		if (filters.pageSize != null) params.set('page[size]', String(filters.pageSize));
		const query = params.toString();

		return this.getAll<T>(`/time_entries${query ? `?${query}` : ''}`, options);
	}


	async listAllTimeEntries<T>(filters: Omit<TimeEntryFilters, 'pageNumber' | 'pageSize'> = {}, options?: RequestInit) {
		const pageSize = 200;
		const entries: T[] = [];

		for (let pageNumber = 1; ; pageNumber += 1) {
			const response = await this.listTimeEntries<CollectionResponse<T>>({ ...filters, pageNumber, pageSize }, options);
			entries.push(...response.data);
			if (response.data.length < pageSize) return entries;
		}
	}

	async listAll<T>(resource: string, options?: RequestInit) {
		const pageSize = 200;
		const records: T[] = [];
		for (let pageNumber = 1; ; pageNumber += 1) {
			const response = await this.getAll<CollectionResponse<T>>(`${resource}?page[number]=${pageNumber}&page[size]=${pageSize}`, options);
			records.push(...response.data);
			if (response.data.length < pageSize) return records;
		}
	}

	get<T>(path: string, options?: RequestInit) {
		return this.request<T>(path, { ...options, method: 'GET' });
	}

	async getOrganization(id: string | number, options?: RequestInit) {
		const response = await this.get<DocumentResponse<Organization>>(`/organizations/${id}`, options);
		return response.data;
	}

	async getOrganizationMemberships(organizationId: string | number, options?: RequestInit) {
		const params = new URLSearchParams({
			'filter[organization_id]': String(organizationId),
			'page[size]': '10',
		});
		const response = await this.get<CollectionResponse<OrganizationMembership>>(`/organization_memberships?${params.toString()}`, options);
		return response.data;
	}

	async getOrganizationMembership(id: string | number, options?: RequestInit) {
		const response = await this.get<DocumentResponse<OrganizationMembership>>(`/organization_memberships/${id}`, options);
		return response.data;
	}

	async getUser(id: string | number, options?: RequestInit) {
		const response = await this.get<DocumentResponse<User>>(`/users/${id}`, options);
		return response.data;
	}

	async getPerson(id: string | number, options?: RequestInit) {
		const response = await this.get<DocumentResponse<Person>>(`/people/${id}`, options);
		return response.data;
	}

	async getUsers(options?: RequestInit) {
		return this.listAll<User>('/users', options);
	}

	async getPeople(options?: RequestInit) {
		return this.listAll<Person>('/people', options);
	}

	post<T>(path: string, body: unknown, options?: RequestInit) {
		return this.request<T>(path, {
			...options,
			method: 'POST',
			body: JSON.stringify(body),
		});
	}

	createTimeEntry<T>(body: unknown, options?: RequestInit) {
		return this.post<T>('/time_entries', body, options);
	}

	patch<T>(path: string, body: unknown, options?: RequestInit) {
		return this.request<T>(path, {
			...options,
			method: 'PATCH',
			body: JSON.stringify(body),
		});
	}

	updateTimeEntry<T>(id: string | number, body: unknown, options?: RequestInit) {
		return this.patch<T>(`/time_entries/${id}`, body, options);
	}

	delete<T = void>(path: string, options?: RequestInit) {
		return this.request<T>(path, { ...options, method: 'DELETE' });
	}

	deleteTimeEntry<T = void>(id: string | number, options?: RequestInit) {
		return this.delete<T>(`/time_entries/${id}`, options);
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
