import { SubmitEvent, useMemo, useState } from 'react';
import { TimeEntry, TimeEntryForm as TimeEntryFormValues } from '../types';
import { emptyForm, formatDate, initialEntries, minutesBetween, today } from '../utils';
import { TimeEntryForm } from './TimeEntryForm';
import { TimeEntryList } from './TimeEntryList';

type DashboardProps = {
	onSignOut: () => void;
};

export function Dashboard({ onSignOut }: DashboardProps) {
	const [selectedDate, setSelectedDate] = useState(today);
	const [entries, setEntries] = useState(initialEntries);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [form, setForm] = useState<TimeEntryFormValues>(emptyForm);
	const visibleEntries = useMemo(() => entries.filter((entry) => entry.date === selectedDate), [entries, selectedDate]);
	const totalMinutes = visibleEntries.reduce((total, entry) => total + minutesBetween(entry.start, entry.end), 0);

	const updateForm = (field: keyof TimeEntryFormValues, value: string) =>
		setForm((current) => ({ ...current, [field]: value }));

	const saveEntry = (event: SubmitEvent) => {
		event.preventDefault();
		if (!form.project) return;
		if (editingId) {
			setEntries((current) => current.map((entry) => (entry.id === editingId ? { ...entry, ...form } : entry)));
		} else {
			setEntries((current) => [...current, { ...form, id: Date.now() }]);
		}
		setForm(emptyForm);
		setEditingId(null);
	};

	const editEntry = (entry: TimeEntry) => {
		setEditingId(entry.id);
		setForm({
			date: entry.date,
			project: entry.project,
			note: entry.note,
			start: entry.start,
			end: entry.end,
		});
	};

	const cancelEdit = () => {
		setEditingId(null);
		setForm(emptyForm);
	};

	return (
		<div className='app-shell'>
			<header className='topbar'>
				<div className='brand-mark'>
					hours<span>.</span>
				</div>
				<div className='topbar-right'>
					<span className='user-avatar'>JD</span>
					<span className='user-name'>Jordan Davis</span>
					<button className='sign-out' onClick={onSignOut}>
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
				<section className='day-summary'>
					<div>
						<span className='summary-label'>{formatDate(selectedDate)}</span>
						<strong>
							{visibleEntries.length} {visibleEntries.length === 1 ? 'entry' : 'entries'}
						</strong>
					</div>
					<div className='total-time'>
						<span>Total tracked</span>
						<strong>
							{Math.floor(totalMinutes / 60)}h {String(totalMinutes % 60).padStart(2, '0')}m
						</strong>
					</div>
				</section>
				<div className='workspace'>
					<TimeEntryList
						entries={visibleEntries}
						onEdit={editEntry}
						onDelete={(id) => setEntries((current) => current.filter((entry) => entry.id !== id))}
					/>
					<TimeEntryForm
						values={form}
						editing={editingId !== null}
						onChange={updateForm}
						onSubmit={saveEntry}
						onCancel={cancelEdit}
					/>
				</div>
			</main>
		</div>
	);
}
