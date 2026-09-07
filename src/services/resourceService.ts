import { ApiClient } from '../api/client';

type NamedResource = {
    id: string;
    attributes: { name?: string; first_name?: string; last_name?: string };
};

export type ResourceOption = { id: string; name: string };

export function listPeople(client: ApiClient) {
    return client.listAll<NamedResource>('/people');
}

export function listServices(client: ApiClient) {
    return client.listAll<NamedResource>('/services');
}

export function toResourceOption(resource: NamedResource): ResourceOption {
    return {
        id: resource.id,
        name: resource.attributes.name ?? ([resource.attributes.first_name, resource.attributes.last_name].filter(Boolean).join(' ') || `Record ${resource.id}`),
    };
}
