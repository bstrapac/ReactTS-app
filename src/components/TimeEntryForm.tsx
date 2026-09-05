import { SubmitEvent } from 'react';
import { TimeEntryForm as TimeEntryFormValues } from '../types';
/*
https://developer.productive.io/reference/resources/time-entries
*/

type TimeEntryFormProps = {
	values: TimeEntryFormValues;
	editing: boolean;
	onChange: (field: keyof TimeEntryFormValues, value: string) => void;
	onSubmit: (event: SubmitEvent) => void;
	onCancel: () => void;
};

export function TimeEntryForm({ values, editing, onChange, onSubmit, onCancel }: TimeEntryFormProps) {
	return (
		<section className='entry-form-section'>
			<div className='section-heading'>
				<h2>{editing ? 'Edit entry' : 'Add entry'}</h2>
				{editing && (
					<button className='cancel-button' onClick={onCancel}>
						Cancel
					</button>
				)}
			</div>
			<form className='entry-form' onSubmit={onSubmit}>
				<label>
					Date
					<input
						type='date'
						value={values.date}
						onChange={({ target: { value } }) => onChange('date', value)}
						required
					/>
				</label>
				<label>
					Project or activity
					<input
						value={values.project}
						onChange={({ target: { value } }) => onChange('project', value)}
						placeholder='e.g. Client work'
						required
					/>
				</label>

				<label>
					What did you work on?
					<textarea
						value={values.note}
						onChange={({ target: { value } }) => onChange('note', value)}
						placeholder='Add a note (optional)'
						rows={3}
					/>
				</label>
				<div className='time-fields'>
					<label>
						Start time
						<input
							type='time'
							value={values.start}
							onChange={({ target: { value } }) => onChange('start', value)}
							required
						/>
					</label>
					<label>
						End time
						<input
							type='time'
							value={values.end}
							onChange={({ target: { value } }) => onChange('end', value)}
							required
						/>
					</label>
				</div>
				<button className='primary-button' type='submit'>
					{editing ? 'Save changes' : 'Add time entry'} <span aria-hidden='true'>→</span>
				</button>
			</form>
		</section>
	);
}
