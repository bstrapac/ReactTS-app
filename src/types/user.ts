import { OrganizationMembership } from './organization';
import { Person } from './person';

export type User = {
    id: string;
    type: 'users';
    attributes: {
        email: string;
        first_name: string;
        last_name: string;
        time_zone: string;
        avatar_url: string | null;
        default_organization_id: number | null;
        default_organization_slug: string | null;
        locale: string;
        two_factor_auth: boolean;
        newsletter_consent: boolean;
        preferences: Record<string, unknown>;
        updated_at: string;
    };
};

export type OrganizationMemberProfile = {
    membership: OrganizationMembership;
    user: User;
    person: Person;
};
