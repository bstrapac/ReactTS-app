import { ApiClient, ApiError } from './client';

test('adds the base URL and bearer token to requests', async () => {
	const fetcher = jest.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
	const client = new ApiClient({
		baseUrl: 'https://api.example.com/',
		getToken: () => 'token-123',
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
	expect(fetcher.mock.calls[0][1].headers.get('Authorization')).toBe('Bearer token-123');
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
