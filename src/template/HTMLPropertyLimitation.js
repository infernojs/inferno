// TODO!! Fill in this list, and run test for each

const target = {
    blank: true,
    parent: true,
    top: true,
    self: true
};

export default {
    A: {
        target: target,
    },
    AREA: {
        target: target,
    },
    FORM: {
        target: target,
        type: {
            hidden: true,
            text: true,
            search: true,
            tel: true,
            url: true,
            email: true,
            password: true,
            date: true,
            month: true,
            week: true,
            time: true,
            'datetime-local': true,
            number: true,
            range: true,
            color: true,
            checkbox: true,
            radio: true,
            file: true,
            submit: true,
            image: true,
            reset: true,
            button: true
        }
    }
};