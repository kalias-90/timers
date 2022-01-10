class Storage {

    static get TYPE_NAMES () {
        return {
            TIMER: 'timer',
            LOG: 'log',
            CONFIG: 'config'
        }
    }

    static exists (type, id) {
        if (!Object.values(Storage.TYPE_NAMES).includes(type)) {
            throw new Error('Unexpected storage record type');
        }
        return !!localStorage.getItem(`${type}.${id}`);
    }

    static save (type, id, value) {
        if (!Object.values(Storage.TYPE_NAMES).includes(type)) {
            throw new Error('Unexpected storage record type');
        }
        localStorage.setItem(`${type}.${id}`, JSON.stringify(value));
    }

    static get (type, id) {
        if (!Object.values(Storage.TYPE_NAMES).includes(type)) {
            throw new Error('Unexpected storage record type');
        }
        return JSON.parse(localStorage.getItem(`${type}.${id}`));
    }

    static remove (type, id) {
        if (!Object.values(Storage.TYPE_NAMES).includes(type)) {
            throw new Error('Unexpected storage record type');
        }
        if (!Storage.exists(type, id)) {
            throw new Error('Storage record does not exists');
        }
        localStorage.removeItem(`${type}.${id}`);
    }

    static getAll (type) {
        if (!Object.values(Storage.TYPE_NAMES).includes(type)) {
            throw new Error('Unexpected storage record type');
        }
        const logKeys = Object.keys(localStorage).filter((k) => k.startsWith(type));
        return logKeys.map((key) => JSON.parse(localStorage.getItem(key)));
    }
    
    static removeAll (type) {
        if (!Object.values(Storage.TYPE_NAMES).includes(type)) {
            throw new Error('Unexpected storage record type');
        }
        const logKeys = Object.keys(localStorage).filter((k) => k.startsWith(type));
        logKeys.forEach((key) => localStorage.removeItem(key));
    }
}