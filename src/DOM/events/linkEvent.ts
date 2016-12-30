import { LinkedEventData } from '../../types';

export default function linkEvent(data: any, event: Function): LinkedEventData{
	return { data, event };
}
