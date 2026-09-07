/// <reference types="jest" />

import { ApiClient, ApiError } from '../api/client';

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
    expect(fetcher.mock.calls[0][1].headers.get('Accept')).toBe('application/vnd.api+json');
    expect(fetcher.mock.calls[0][1].headers.get('Content-Type')).toBe('application/vnd.api+json');
});

test('lists time entries with supported filters', async () => {
    const fetcher = jest.fn().mockResolvedValue(new Response('[]', { status: 200 }));
    const client = new ApiClient({ baseUrl: 'https://api.example.com/api/v2', fetcher });

    await client.listTimeEntries({ personId: 12, after: '2026-03-01', before: '2026-03-31' });

    expect(fetcher).toHaveBeenCalledWith(
        'https://api.example.com/api/v2/time_entries?filter%5Bperson_id%5D=12&filter%5Bafter%5D=2026-03-01&filter%5Bbefore%5D=2026-03-31',
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
    expect(fetcher.mock.calls[0][1].method).toBe('POST');
    expect(fetcher.mock.calls[0][1].headers.get('Content-Type')).toBe('application/vnd.api+json');
    expect(fetcher.mock.calls[0][1].body).toBe(JSON.stringify('/payload'));
    expect(fetcher.mock.calls[1][0]).toBe('https://api.example.com/api/v2/time_entries/entry-1');
    expect(fetcher.mock.calls[1][1].method).toBe('DELETE');
    expect(fetcher.mock.calls[1][1].body).toBeUndefined();
});

test('retrieves every time-entry page', async () => {
    const firstPage = Array.from({ length: 200 }, (_, id) => ({ id: String(id) }));
    const fetcher = jest
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify({ data: firstPage }), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ id: '200' }] }), { status: 200 }));
    const client = new ApiClient({ baseUrl: 'https://api.example.com/api/v2', fetcher });

    await expect(client.listAllTimeEntries<{ id: string }>({ personId: 12 })).resolves.toHaveLength(201);
    expect(fetcher.mock.calls[0][0]).toBe('https://api.example.com/api/v2/time_entries?filter%5Bperson_id%5D=12&page%5Bnumber%5D=1&page%5Bsize%5D=200');
    expect(fetcher.mock.calls[1][0]).toBe('https://api.example.com/api/v2/time_entries?filter%5Bperson_id%5D=12&page%5Bnumber%5D=2&page%5Bsize%5D=200');
});

test('retrieves every page for a related resource', async () => {
    const firstPage = Array.from({ length: 200 }, (_, id) => ({ id: String(id) }));
    const fetcher = jest
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify({ data: firstPage }), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ data: [] }), { status: 200 }));
    const client = new ApiClient({ baseUrl: 'https://api.example.com/api/v2', fetcher });

    await expect(client.listAll<{ id: string }>('/services')).resolves.toHaveLength(200);
    expect(fetcher.mock.calls[0][0]).toBe('https://api.example.com/api/v2/services?page[number]=1&page[size]=200');
    expect(fetcher.mock.calls[1][0]).toBe('https://api.example.com/api/v2/services?page[number]=2&page[size]=200');
});

test('gets an organization with the configured authentication headers', async () => {
    const fetcher = jest.fn().mockResolvedValue(new Response(JSON.stringify({
        data: {
            id: '61506', type: 'organizations', attributes: { name: 'Example organization' },
        }
    }), { status: 200 }));
    const client = new ApiClient({ baseUrl: 'https://api.example.com/api/v2', organizationId: 61506, token: 'token-123', fetcher });

    await expect(client.getOrganization(61506)).resolves.toEqual(expect.objectContaining({ id: '61506' }));
    expect(fetcher.mock.calls[0][0]).toBe('https://api.example.com/api/v2/organizations/61506');
    expect(fetcher.mock.calls[0][1].headers.get('X-Auth-Token')).toBe('token-123');
    expect(fetcher.mock.calls[0][1].headers.get('X-Organization-Id')).toBe('61506');
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
