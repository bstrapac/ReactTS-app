export type ResourceIdentifier<Type extends string> = {
	type: Type;
	id: string;
};

export type ToOneRelationship<Type extends string> = {
	data: ResourceIdentifier<Type> | null;
};

export type TimeEntryRelationships = {
	person: ToOneRelationship<'people'>;
	service: ToOneRelationship<'services'>;
	task: ToOneRelationship<'tasks'>;
	approver: ToOneRelationship<'people'>;
};

export type TimeEntryApiResource = {
	id: string;
	type: 'time_entries';
	attributes: {
		date: string;
		note: string;
		time: number;
		started_at: string | null;
	};
	relationships: TimeEntryRelationships;
};

export type TimeEntry = {
	id: string;
	date: string;
	note: string;
	createdAt: string | null;
	time: number | null;
	trackMethodId: number | null;
	startedAt: string | null;
	timerStartedAt: string | null;
	timerStoppedAt: string | null;
	approved: boolean | null;
	approvedAt: string | null;
	updatedAt: string | null;
	calendarEventId: string | null;
	invoiceAttributionId: string | null;
	invoiced: boolean | null;
	overhead: boolean | null;
	rejected: boolean | null;
	rejectedReason: string | null;
	rejectedAt: string | null;
	lastActivityAt: string | null;
	submitted: boolean | null;
	currency: string | null;
	relationships: TimeEntryRelationships;
};

export type TimeEntryFormValues = Pick<TimeEntry, 'date' | 'note'> & {
	startedAt: string;
	endsAt: string;
	personId: string;
};

export const defaultTimeEntryValues: Omit<TimeEntry, 'id' | 'date' | 'note'> = {
	createdAt: null,
	time: null,
	trackMethodId: null,
	startedAt: null,
	timerStartedAt: null,
	timerStoppedAt: null,
	approved: null,
	approvedAt: null,
	updatedAt: null,
	calendarEventId: null,
	invoiceAttributionId: null,
	invoiced: null,
	overhead: null,
	rejected: null,
	rejectedReason: null,
	rejectedAt: null,
	lastActivityAt: null,
	submitted: null,
	currency: null,
	relationships: {
		person: { data: null },
		service: { data: null },
		task: { data: null },
		approver: { data: null },
	},
};

