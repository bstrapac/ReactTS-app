import { TimeEntry, TimeEntryForm } from './types';

export const today = new Date().toISOString().slice(0, 10);

export const emptyForm: TimeEntryForm = {
	date: '',
	project: '',
	note: '',
	start: '09:00',
	end: '10:00',
};

export const initialEntries: TimeEntry[] = [
	{
		id: 1,
		date: today,
		project: 'Product design',
		note: 'Refined the onboarding flow',
		start: '09:00',
		end: '11:30',
	},
	{
		id: 2,
		date: today,
		project: 'Engineering',
		note: 'API integration and testing',
		start: '13:00',
		end: '16:15',
	},
	{
		id: 3,
		date: today,
		project: 'Team sync',
		note: 'Weekly planning and check-in',
		start: '16:30',
		end: '17:00',
	},
];

export const duration = (start: string, end: string) => {
	const minutes = (new Date(`1970-01-01T${end}`).getTime() - new Date(`1970-01-01T${start}`).getTime()) / 60000;
	return minutes > 0 ? `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m` : '0h 00m';
};

export const minutesBetween = (start: string, end: string) =>
	Math.max(0, (new Date(`1970-01-01T${end}`).getTime() - new Date(`1970-01-01T${start}`).getTime()) / 60000);

export const formatDate = (date: string) =>
	new Intl.DateTimeFormat('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	}).format(new Date(`${date}T12:00:00`));
