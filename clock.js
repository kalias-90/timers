class Clock {
    static listeners = new Set();

    static intervalId = setInterval(() => {
        Clock.listeners.forEach((cb) => cb());
    }, 30000);

    static subscribe (callback) {
        Clock.listeners.add(callback);
    }

    static unsubscribe (callback) {
        if (!Clock.listeners.has(callback)) {
            throw new Error('Handler not found');
        }
        Clock.listeners.delete(callback);
    }
}