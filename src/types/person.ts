import { ToManyRelationship, ToOneRelationship } from './relationships';

export type PersonRelationships = {
    company: ToOneRelationship<'companies'>;
    manager: ToOneRelationship<'people'>;
    teams: ToManyRelationship<'teams'>;
};

export type Person = {
    id: string;
    type: 'people';
    attributes: {
        agent: boolean;
        avatar_url: string | null;
        contact: Record<string, unknown>;
        deactivated_at: string | null;
        email: string | null;
        first_name: string;
        last_name: string;
        nickname: string | null;
        title: string | null;
        role_id: number | null;
        joined_at: string | null;
        is_user: boolean;
        user_id: number | null;
        tag_list: string[];
        virtual: boolean;
        created_at: string;
    };
    relationships: PersonRelationships;
};
