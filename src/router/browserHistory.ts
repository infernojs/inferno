import {
	createBrowserHistory,
} from 'history';

export interface HistoryProps {
	basename?: string;
	forceRefresh?: boolean;
	keyLength?: number;
	getUserConfirmation? (message: string, callback: void): void;
}

export default class BrowserHistory {
	history: any;

	constructor(props: HistoryProps) {
		this.history = createBrowserHistory(props);
	}
}
