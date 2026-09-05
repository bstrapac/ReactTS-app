/**
 {
	 "data": {
		"id": "84848214",
		"type": "time_entries",
		"attributes": {
		"date": "2026-03-15",
		"created_at": "2026-03-15T09:30:00.000+00:00",
		"time": 480,
		"note": "Implemented user authentication flow",
		"track_method_id": 1,
		"started_at": "2026-03-15T09:00:00.000+00:00",
		"timer_started_at": null,
		"timer_stopped_at": null,
		"approved": false,
		"approved_at": null,
		"updated_at": "2026-03-15T17:30:00.000+00:00",
		"calendar_event_id": null,
		"invoice_attribution_id": null,
		"invoiced": false,
		"overhead": false,
		"rejected": false,
		"rejected_reason": null,
		"rejected_at": null,
		"last_activity_at": "2026-03-15T09:30:00.000+00:00",
		"submitted": false,
		"currency": "USD"
		},
		"relationships": {
		"person": {
			"data": {
			"type": "people",
			"id": "12"
			}
		},
		"service": {
			"data": {
			"type": "services",
			"id": "1856422"
			}
		},
		"task": {
			"data": {
			"type": "tasks",
			"id": "120501"
			}
		},
		"approver": {
			"data": null
		}
		}
	},
	"included": []
	}
 *
 */

export type TimeEntry = {
	id: number;
	date: string;
	project: string;
	note: string;
	start: string;
	end: string;
};

export type TimeEntryForm = Omit<TimeEntry, 'id'>;
