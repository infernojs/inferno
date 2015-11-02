import createServerSideMarkup from './createServerSideMarkup';

export default (args, fragment, component) => {

    if (component) {
		
	} else {
        
		// TODO! Find a solution for better performance
        let params = [(...args) => createServerSideMarkup.apply(fragment, args)],
            length = args && args.length;

        if (length) {

            for (let i = 0; i < length; i++) {
                params.push(args[i]);
            }
        }

        return fragment.apply(null, params);
    }
};