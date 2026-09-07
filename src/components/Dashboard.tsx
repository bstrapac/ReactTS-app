import { SubmitEvent, useEffect, useMemo, useState } from 'react';
import { useSession } from '../context/SessionContext';
import '../styles/dashboard.css';
import { defaultTimeEntryValues, SelectOption, TimeEntry, TimeEntryApiResource, TimeEntryFormValues } from '../types';
import { createTimeEntry, deleteTimeEntry, listTimeEntries, updateTimeEntry } from '../services/timeEntryService';
import { listPeople, listServices, toResourceOption } from '../services/resourceService';
import { dateTimeAt, emptyForm, endTime, formatDate, fromApiTimeEntry, initialEntries, minutesBetween, minutesBetweenTimes, timeOfDay, toApiTimeEntryPayload, today } from '../utils';
import { TimeEntryForm } from './TimeEntryForm';
import { TimeEntryList } from './TimeEntryList';

const DAILY_MINUTES_LIMIT = 8 * 60;

export function Dashboard() {
	const { signOut, profile, client } = useSession();
	const [selectedDate, setSelectedDate] = useState(today);
	const [entries, setEntries] = useState(initialEntries);
	const [entriesError, setEntriesError] = useState('');
	const [people, setPeople] = useState<SelectOption[]>([]);
	const [services, setServices] = useState<SelectOption[]>([]);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [form, setForm] = useState<TimeEntryFormValues>(emptyForm);
	const [formError, setFormError] = useState('');
	const visibleEntries = useMemo(() => entries.filter((entry) => entry.date === selectedDate), [entries, selectedDate]);
	const totalMinutes = visibleEntries.reduce((total, entry) => total + minutesBetween(entry.time), 0);

	useEffect(() => {
		if (!client) return;
		let active = true;
		Promise.all([
			listTimeEntries(client, profile?.person.id ?? ''),
			listPeople(client),
			listServices(client),
		])
			.then(([timeEntries, peopleResponse, servicesResponse]) => {
				if (!active) return;
				setEntries(timeEntries.map(fromApiTimeEntry));
				setPeople(peopleResponse.map(toResourceOption));
				setServices(servicesResponse.map(toResourceOption));
			})
			.catch(() => {
				if (active) setEntriesError('Could not load entries from the API. Showing local entries instead.');
			});
		return () => { active = false; };
	}, [client, profile?.person.id]);

	useEffect(() => {
		if (!profile || form.personId) return;
		setForm((current) => ({ ...current, personId: profile.person.id }));
	}, [form.personId, profile]);

	const updateForm = (field: keyof TimeEntryFormValues, value: string) => {
		setFormError('');
		setForm((current) => ({
			...current,
			[field]: value,
		}));
	};

	const saveEntry = async (event: SubmitEvent) => {
		event.preventDefault();
		if (!form.date || !form.note.trim() || !form.startedAt || !form.endsAt || !form.personId || !form.serviceId) return;
		const duration = minutesBetweenTimes(form.startedAt, form.endsAt);
		if (duration == null || duration <= 0) {
			setFormError('End time must be later than start time on the selected date.');
			return;
		}
		const otherEntriesMinutes = entries
			.filter((entry) => entry.date === form.date && entry.id !== editingId)
			.reduce((total, entry) => total + minutesBetween(entry.time), 0);
		if (otherEntriesMinutes + duration > DAILY_MINUTES_LIMIT) {
			setFormError('Daily total cannot exceed 8 hours. Reduce this entry or another entry for this date.');
			return;
		}
		const entryValues = {
			date: form.date,
			note: form.note,
			startedAt: dateTimeAt(form.date, form.startedAt),
			time: duration,
		};
		const existing = entries.find((entry) => entry.id === editingId);
		const entry: TimeEntry = {
			...(existing ?? defaultTimeEntryValues), ...entryValues, id: editingId ?? '',
			relationships: { ...(existing?.relationships ?? defaultTimeEntryValues.relationships), person: { data: { type: 'people', id: form.personId } }, service: { data: { type: 'services', id: form.serviceId } } },
		};
		try {
			if (!client) throw new Error('No authenticated API client.');
			const response = editingId
				? await updateTimeEntry<{ data: TimeEntryApiResource }>(client, editingId, toApiTimeEntryPayload(entry))
				: await createTimeEntry<{ data: TimeEntryApiResource }>(client, toApiTimeEntryPayload(entry));
			const responseEntry = fromApiTimeEntry(response.data);
			const saved: TimeEntry = {
				...responseEntry,
				relationships: {
					...responseEntry.relationships,
					person: responseEntry.relationships.person.data ? responseEntry.relationships.person : entry.relationships.person,
					service: responseEntry.relationships.service.data ? responseEntry.relationships.service : entry.relationships.service,
				},
			};
			setEntries((current) => editingId ? current.map((item) => item.id === editingId ? saved : item) : [...current, saved]);
		} catch {
			setFormError('Could not save this entry to the API.');
			return;
		}
		setForm(emptyForm);
		setEditingId(null);
		setFormError('');
	};

	const editEntry = (entry: TimeEntry) => {
		setEditingId(entry.id);
		setFormError('');
		setForm({
			date: entry.date,
			note: entry.note,
			startedAt: timeOfDay(entry.startedAt),
			endsAt: endTime(entry.startedAt, entry.time) ?? '',
			personId: entry.relationships.person.data?.id ?? '',
			serviceId: entry.relationships.service.data?.id ?? '',
		});
	};

	const cancelEdit = () => {
		setEditingId(null);
		setForm(emptyForm);
		setFormError('');
	};

	const deleteEntry = async (id: string) => {
		try {
			if (!client) throw new Error('No authenticated API client.');
			await deleteTimeEntry(client, id);
			setEntries((current) => current.filter((entry) => entry.id !== id));
		} catch {
			setEntriesError('Could not delete this entry from the API.');
		}
	};

	return (
		<div className='app-shell'>
			<header className='topbar'>
				<div className='brand-mark'>
					hours<span>.</span>
				</div>
				<div className='topbar-right'>
					<span className='user-avatar'>{profile?.person.attributes.first_name.slice(0, 2).toUpperCase()}</span>
					<span className='user-name'>{profile?.person.attributes.first_name} {profile?.person.attributes.last_name}</span>
					<button className='sign-out' onClick={signOut}>
						Sign out
					</button>
				</div>
			</header>
			<main className='dashboard'>
				<div className='dashboard-heading'>
					<div>
						<p className='eyebrow'>WORK LOG</p>
						<h1>
							Your time, <em>well spent.</em>
						</h1>
					</div>
					<div className='dashboard-controls'>
						<div className='header-total' aria-live='polite'>
							<span>Total tracked</span>
							<strong>
								{Math.floor(totalMinutes / 60)}h {String(totalMinutes % 60).padStart(2, '0')}m
							</strong>
							<small>of 8h daily limit</small>
						</div>
						<div className='date-picker'>
							<label htmlFor='date'>Viewing date</label>
							<input
								id='date'
								type='date'
								value={selectedDate}
								onChange={(event) => setSelectedDate(event.target.value)}
							/>
						</div>
					</div>
				</div>
				<section className='day-summary'>
					<div>
						<span className='summary-label'>{formatDate(selectedDate)}</span>
						<strong>
							{visibleEntries.length} {visibleEntries.length === 1 ? 'entry' : 'entries'}
						</strong>
					</div>
				</section>
				{entriesError && <p className='entries-error' role='alert'>{entriesError}</p>}
				<div className='workspace'>
					<TimeEntryList
						entries={visibleEntries}
						people={people}
						onEdit={editEntry}
						onDelete={deleteEntry}
					/>
					<TimeEntryForm
						values={form}
						editing={editingId !== null}
						onChange={updateForm}
						onSubmit={saveEntry}
						onCancel={cancelEdit}
						error={formError}
						people={people}
						services={services}
					/>
				</div>
			</main>
		</div>
	);
}
