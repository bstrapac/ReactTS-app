import { ToOneRelationship } from './relationships';

export type OrganizationMembershipRelationships = {
    organization: ToOneRelationship<'organizations'>;
    person: ToOneRelationship<'people'>;
    user: ToOneRelationship<'users'>;
};

export type Organization = {
    id: string;
    type: 'organizations';
    attributes: Record<string, unknown>;
};

export type OrganizationMembership = {
    id: string;
    type: 'organization_memberships';
    attributes: {
        updated_at: string;
        position: number | null;
        tasks_layout_id: number | null;
        time_reminders: boolean;
        email_notifications: boolean;
        weekly_emails: boolean;
        preferences: Record<string, unknown>;
        quick_start_config: Record<string, unknown>;
    };
    relationships: OrganizationMembershipRelationships;
};
