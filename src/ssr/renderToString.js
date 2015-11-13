import createServerSideMarkup from './createServerSideMarkup';
import bind from '../util/bind';

export default (args, fragment, component) => {

    if (component) {
		
	} else {
        
		// TODO! Find a solution for better performance
        let params = [bind(fragment, createServerSideMarkup)],
            length = args && args.length;

        if (length) {

            for (let i = 0; i < length; i++) {
                params.push(args[i]);
            }
        }

        return fragment.apply(null, params);
    }
};