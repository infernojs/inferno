function validateFragmentValues(oldValue, newValue) {

   // TODO!! Should be a object literal containing the props that are boolean
    const isBool = false;

    if (oldValue != null) {

        if (newValue == null) {

            return isBool ? false : '';

        } else {

            if (newValue && oldValue !== newValue) {

                return isBool ? true : newValue;

            }
        }

    } else if (newValue != null) {

        return isBool ? true : newValue;
    }
}

export default validateFragmentValues;