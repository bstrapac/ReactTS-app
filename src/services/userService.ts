import { ApiClient } from '../api/client';
import { OrganizationMembership, OrganizationMemberProfile, Person, User } from '../types';

export async function getOrganizationMemberProfile(client: ApiClient, membership: OrganizationMembership): Promise<OrganizationMemberProfile> {
    const userId = membership.relationships?.user?.data?.id;
    const personId = membership.relationships?.person?.data?.id;
    const user = userId ? await client.getUser(userId) : (await client.getUsers())[0];
    if (!user) throw new Error('No user was found for this organization.');

    let person: Person | undefined;
    if (personId) {
        person = await client.getPerson(personId);
    } else {
        const people = await client.getPeople();
        person = people.find((candidate) => String(candidate.attributes.user_id) === String(user.id));
    }
    if (!person) throw new Error('No person was found for the organization user.');
    return { membership, user, person };
}

export function userDisplayName(user: User) {
    return [user.attributes.first_name, user.attributes.last_name].filter(Boolean).join(' ') || user.attributes.email;
}

export function personDisplayName(person: Person) {
    return [person.attributes.first_name, person.attributes.last_name].filter(Boolean).join(' ') || person.attributes.email || `Person ${person.id}`;
}
