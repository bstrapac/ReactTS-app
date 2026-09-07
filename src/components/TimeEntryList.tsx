import { SelectOption, TimeEntry } from '../types';
import { duration, endTime, formatTime, personName } from '../utils';

type TimeEntryListProps = {
	entries: TimeEntry[];
	people: SelectOption[];
	onEdit: (entry: TimeEntry) => void;
	onDelete: (id: string) => void;
};

export function TimeEntryList({ entries, people, onEdit, onDelete }: TimeEntryListProps) {
	return (
		<section className='entries-section'>
			<div className='section-heading'>
				<h2>Time entries</h2>
				<span className='entry-count'>{entries.length}</span>
			</div>
			{entries.length === 0 ? (
				<div className='empty-state'>
					<span className='empty-icon'>＋</span>
					<h3>A quiet day</h3>
					<p>No time entries for this date yet.</p>
				</div>
			) : (
				<div className='entry-list'>
					{entries.map((entry) => (
						<article className='entry-row' key={entry.id}>
							<div className='entry-time'>
								<span>{entry.date}</span>
								<strong>{formatTime(entry.startedAt)}</strong>
								<span>to {formatTime(endTime(entry.startedAt, entry.time))}</span>
							</div>
							<div className='entry-detail'>
								<strong>{entry.note || 'Untitled entry'}</strong>
								<span>{personName(people, entry.relationships.person.data?.id)}</span>
							</div>
							<span className='entry-duration'>{duration(entry.time)}</span>
							<div className='entry-actions'>
								<button type='button' aria-label={`Edit ${entry.note || 'entry'}`} onClick={() => onEdit(entry)}>
									Edit
								</button>
								<button type='button' aria-label={`Delete ${entry.note || 'entry'}`} onClick={() => onDelete(entry.id)}>
									Delete
								</button>
							</div>
						</article>
					))}
				</div>
			)}
		</section>
	);
}
