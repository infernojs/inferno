import { LinkedEventData } from '../../core/structures';

export default function linkEvent(data: any, event: Function): LinkedEventData{
	return { data, event };
}
