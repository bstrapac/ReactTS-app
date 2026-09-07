import { ApiClient } from '../api/client';
import { TimeEntryApiResource } from '../types';

export function listTimeEntries(client: ApiClient, personId: string) {
    return client.listAllTimeEntries<TimeEntryApiResource>({ personId });
}

export function createTimeEntry<T>(client: ApiClient, body: unknown) {
    return client.createTimeEntry<T>(body);
}

export function updateTimeEntry<T>(client: ApiClient, id: string, body: unknown) {
    return client.updateTimeEntry<T>(id, body);
}

export function deleteTimeEntry(client: ApiClient, id: string) {
    return client.deleteTimeEntry(id);
}
