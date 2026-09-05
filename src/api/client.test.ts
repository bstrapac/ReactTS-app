/// <reference types="jest" />

import { ApiClient, ApiError } from './client';

test('adds the base URL and Productive authentication headers to requests', async () => {
	const fetcher = jest.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
	const client = new ApiClient({
		baseUrl: 'https://api.example.com/',
		token: 'token-123',
		organizationId: 61506,
		fetcher,
	});

	await expect(client.get<{ ok: boolean }>('/health')).resolves.toEqual({
		ok: true,
	});
	expect(fetcher).toHaveBeenCalledWith(
		'https://api.example.com/health',
		expect.objectContaining({
			method: 'GET',
			headers: expect.any(Headers),
		}),
	);
	expect(fetcher.mock.calls[0][1].headers.get('X-Auth-Token')).toBe('token-123');
	expect(fetcher.mock.calls[0][1].headers.get('X-Organization-Id')).toBe('61506');
});

test('lists time entries with supported filters', async () => {
	const fetcher = jest.fn().mockResolvedValue(new Response('[]', { status: 200 }));
	const client = new ApiClient({ baseUrl: 'https://api.example.com/api/v2', fetcher });

	await client.listTimeEntries({ personId: 12, after: '2026-03-01', before: '2026-03-31' });

	expect(fetcher).toHaveBeenCalledWith(
		'https://api.example.com/api/v2/time_entries?person_id=12&after=2026-03-01&before=2026-03-31',
		expect.objectContaining({ method: 'GET' }),
	);
});

test('creates and deletes a time entry through the resource endpoints', async () => {
	const fetcher = jest
		.fn()
		.mockResolvedValueOnce(new Response(JSON.stringify({ id: 'entry-1' }), { status: 201 }))
		.mockResolvedValueOnce(new Response(null, { status: 204 }));
	const client = new ApiClient({ baseUrl: 'https://api.example.com/api/v2', fetcher });

	await expect(client.createTimeEntry('/payload')).resolves.toEqual({ id: 'entry-1' });
	await expect(client.deleteTimeEntry('entry-1')).resolves.toBeUndefined();

	expect(fetcher.mock.calls[0][0]).toBe('https://api.example.com/api/v2/time_entries');
	expect(fetcher.mock.calls[0][1].body).toBe(JSON.stringify('/payload'));
	expect(fetcher.mock.calls[1][0]).toBe('https://api.example.com/api/v2/time_entries/entry-1');
});

test('throws ApiError with the response body for failed requests', async () => {
	const fetcher = jest.fn().mockResolvedValue(
		new Response(JSON.stringify({ message: 'Unauthorized' }), {
			status: 401,
		}),
	);
	const client = new ApiClient({ fetcher });

	await expect(client.get('/private')).rejects.toEqual(
		expect.objectContaining({
			name: 'ApiError',
			status: 401,
			body: { message: 'Unauthorized' },
		} satisfies Partial<ApiError>),
	);
});
