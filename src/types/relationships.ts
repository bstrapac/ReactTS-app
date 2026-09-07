export type ResourceIdentifier<Type extends string> = {
    type: Type;
    id: string;
};

export type ToOneRelationship<Type extends string> = {
    data: ResourceIdentifier<Type> | null;
};

export type ToManyRelationship<Type extends string> = {
    data: ResourceIdentifier<Type>[];
};
