import { SubmitEvent } from 'react';
import { TimeEntryFormValues } from '../types';
import { people } from '../utils';
/*
https://developer.productive.io/reference/resources/time-entries
*/

type TimeEntryFormProps = {
	values: TimeEntryFormValues;
	editing: boolean;
	onChange: (field: keyof TimeEntryFormValues, value: string) => void;
	onSubmit: (event: SubmitEvent) => void;
	onCancel: () => void;
	error: string;
};

export function TimeEntryForm({ values, editing, onChange, onSubmit, onCancel, error }: TimeEntryFormProps) {
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
					What did you work on?
					<textarea
						value={values.note}
						onChange={({ target: { value } }) => onChange('note', value)}
						placeholder='Describe the work'
						rows={3}
						required
					/>
				</label>
				<label>
					Person assigned
					<select
						value={values.personId}
						onChange={({ target: { value } }) => onChange('personId', value)}
						required
					>
						<option value='' disabled>Select a person</option>
						{people.map((person) => (
							<option key={person.id} value={person.id}>{person.name}</option>
						))}
					</select>
				</label>
				<label>
					Started at
					<input
						type='time'
						value={values.startedAt}
						onChange={({ target: { value } }) => onChange('startedAt', value)}
						required
					/>
				</label>
				<label>
					Ends at
					<input
						type='time'
						value={values.endsAt}
						onChange={({ target: { value } }) => onChange('endsAt', value)}
						required
					/>
				</label>
				{error && <p className='form-error' role='alert'>{error}</p>}
				<button className='primary-button' type='submit'>
					{editing ? 'Save changes' : 'Add time entry'} <span aria-hidden='true'>→</span>
				</button>
			</form>
		</section>
	);
}
