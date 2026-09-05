import { SubmitEvent, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../api/client';
import { useSession } from '../context/SessionContext';
import { defaultTimeEntryValues, TimeEntry, TimeEntryFormValues } from '../types';
import { dateTimeAt, emptyForm, endTime, formatDate, fromApiTimeEntry, initialEntries, minutesBetween, minutesBetweenTimes, timeOfDay, today } from '../utils';
import { TimeEntryForm } from './TimeEntryForm';
import { TimeEntryList } from './TimeEntryList';

const DAILY_MINUTES_LIMIT = 8 * 60;

export function Dashboard() {
	const { email, signOut } = useSession();
	const [selectedDate, setSelectedDate] = useState(today);
	const [entries, setEntries] = useState(initialEntries);
	const [entriesError, setEntriesError] = useState('');
	const [editingId, setEditingId] = useState<string | null>(null);
	const [form, setForm] = useState<TimeEntryFormValues>(emptyForm);
	const [formError, setFormError] = useState('');
	const visibleEntries = useMemo(() => entries.filter((entry) => entry.date === selectedDate), [entries, selectedDate]);
	const totalMinutes = visibleEntries.reduce((total, entry) => total + minutesBetween(entry.time), 0);

	useEffect(() => {
		let active = true;
		apiClient.listAllTimeEntries<Parameters<typeof fromApiTimeEntry>[0]>()
			.then((response) => {
				if (active) setEntries(response.map(fromApiTimeEntry));
			})
			.catch(() => {
				if (active) setEntriesError('Could not load entries from the API. Showing local entries instead.');
			});
		return () => { active = false; };
	}, []);

	const updateForm = (field: keyof TimeEntryFormValues, value: string) => {
		setFormError('');
		setForm((current) => ({
			...current,
			[field]: value,
		}));
	};

	const saveEntry = (event: SubmitEvent) => {
		event.preventDefault();
		if (!form.date || !form.note.trim() || !form.startedAt || !form.endsAt || !form.personId) return;
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
		if (editingId) {
			setEntries((current) => current.map((entry) => (
				entry.id === editingId
					? { ...entry, ...entryValues, relationships: { ...entry.relationships, person: { data: { type: 'people', id: form.personId } } } }
					: entry
			)));
		} else {
			setEntries((current) => [
				...current,
				{
					...defaultTimeEntryValues,
					...entryValues,
					id: String(Date.now()),
					relationships: { ...defaultTimeEntryValues.relationships, person: { data: { type: 'people', id: form.personId } } },
				},
			]);
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
		});
	};

	const cancelEdit = () => {
		setEditingId(null);
		setForm(emptyForm);
		setFormError('');
	};

	return (
		<div className='app-shell'>
			<header className='topbar'>
				<div className='brand-mark'>
					hours<span>.</span>
				</div>
				<div className='topbar-right'>
					<span className='user-avatar'>{email?.slice(0, 2).toUpperCase()}</span>
					<span className='user-name'>{email}</span>
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
						onEdit={editEntry}
						onDelete={(id: string) => setEntries((current) => current.filter((entry) => entry.id !== id))}
					/>
					<TimeEntryForm
						values={form}
						editing={editingId !== null}
						onChange={updateForm}
						onSubmit={saveEntry}
						onCancel={cancelEdit}
						error={formError}
					/>
				</div>
			</main>
		</div>
	);
}
