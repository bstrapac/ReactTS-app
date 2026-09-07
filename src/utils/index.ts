import { defaultTimeEntryValues, SelectOption, TimeEntry, TimeEntryApiResource, TimeEntryFormValues } from '../types';

export const today = new Date().toISOString().slice(0, 10);

export const emptyForm: TimeEntryFormValues = {
    date: '',
    note: '',
    startedAt: '',
    endsAt: '',
    personId: '',
    serviceId: '',
};

export const personName = (people: SelectOption[], personId: string | null | undefined) =>
    people.find((person) => person.id === personId)?.name ?? 'Unknown person';

export const fromApiTimeEntry = (entry: TimeEntryApiResource): TimeEntry => ({
    ...defaultTimeEntryValues,
    id: entry.id,
    date: entry.attributes.date,
    note: entry.attributes.note,
    time: entry.attributes.time,
    startedAt: entry.attributes.started_at,
    relationships: {
        person: entry.relationships?.person ?? { data: null },
        service: entry.relationships?.service ?? { data: null },
        task: entry.relationships?.task ?? { data: null },
        approver: entry.relationships?.approver ?? { data: null },
    },
});

export const toApiTimeEntryPayload = (entry: TimeEntry) => ({
    data: {
        type: 'time_entries',
        attributes: { date: entry.date, note: entry.note, time: entry.time, started_at: entry.startedAt },
        relationships: {
            person: entry.relationships.person,
            service: entry.relationships.service,
            ...(entry.relationships.task.data ? { task: entry.relationships.task } : {}),
        },
    },
});

export const initialEntries: TimeEntry[] = [
    {
        ...defaultTimeEntryValues,
        id: '1',
        date: today,
        note: 'Refined the onboarding flow',
        startedAt: `${today}T09:00:00.000+00:00`,
        time: 150,
    },
    {
        ...defaultTimeEntryValues,
        id: '2',
        date: today,
        note: 'API integration and testing',
        startedAt: `${today}T13:00:00.000+00:00`,
        time: 195,
    },
    {
        ...defaultTimeEntryValues,
        id: '3',
        date: today,
        note: 'Weekly planning and check-in',
        startedAt: `${today}T16:30:00.000+00:00`,
        time: 30,
    },
];

export const duration = (minutes: number | null) =>
    minutes && minutes > 0 ? `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m` : '0h 00m';

export const minutesBetween = (minutes: number | null) => Math.max(0, minutes ?? 0);

export const minutesBetweenTimes = (startedAt: string, endsAt: string) => {
    const toMinutes = (time: string) => {
        const match = time.match(/^(\d{2}):(\d{2})$/);
        return match ? Number(match[1]) * 60 + Number(match[2]) : null;
    };

    const start = toMinutes(startedAt);
    const end = toMinutes(endsAt);
    return start == null || end == null ? null : end - start;
};

export const timeOfDay = (dateTime: string | null) => {
    const match = dateTime?.match(/T(\d{2}:\d{2})/);
    return match?.[1] ?? '';
};

// Time entries represent the wall-clock time selected by the user, not a UTC instant.
export const dateTimeAt = (date: string, time: string) => `${date}T${time}:00`;

export const endTime = (startedAt: string | null, minutes: number | null) => {
    if (!startedAt || minutes == null) return null;

    const match = startedAt.match(/T(\d{2}):(\d{2})/);
    if (!match) return null;

    const totalMinutes = Number(match[1]) * 60 + Number(match[2]) + minutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
};

export const formatTime = (dateTime: string | null) => {
    if (!dateTime) return 'Not started';
    if (/^\d{2}:\d{2}$/.test(dateTime)) return dateTime;
    const time = timeOfDay(dateTime);
    if (time) return time;

    const date = new Date(dateTime);
    return Number.isNaN(date.getTime())
        ? 'Not started'
        : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
};

export const formatDate = (date: string) =>
    new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(`${date}T12:00:00`));
