import { ApiClient } from '../api/client';
import { OrganizationMemberProfile } from '../types';
import { getOrganizationMemberProfile } from './userService';

export type LoginResult = {
    client: ApiClient;
    profile: OrganizationMemberProfile;
};

export async function login(organizationId: string, token: string): Promise<LoginResult> {
    const client = new ApiClient({ organizationId, token });
    await client.getOrganization(organizationId);
    const memberships = await client.getOrganizationMemberships(organizationId);
    const membershipId = memberships[0]?.id;
    if (!membershipId) throw new Error('No organization membership was found for this organization.');
    const membership = await client.getOrganizationMembership(membershipId);
    const profile = await getOrganizationMemberProfile(client, membership);
    return { client, profile };
}
