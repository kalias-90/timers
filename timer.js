class TimerError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TimerError';
    }
}

const TimerConfigs = {
    PAUSE_OTHERS: 'pauseOthers'
};

class TimerStorage {
    static store (timer) {
        localStorage.setItem(`timer.${timer.id}`, JSON.stringify({
            name: timer.name,
            seconds: timer.seconds,
            paused: timer.paused,
            date: (new Date()).getTime()
        }));
    }

    static discard (timer) {
        localStorage.removeItem(`timer.${timer.name}`);
    }

    static restore (restoreHandler) {
        for (let i = 0; i < localStorage.length; i++){
            const key = localStorage.key(i);
            if (key.startsWith('timer.')) {
                let { name, seconds, paused, date } = JSON.parse(localStorage.getItem(key));

                if (!paused) {
                    const now = (new Date()).getTime();
                    seconds += Math.round((now - date)/1000);
                };

                restoreHandler(name, paused, seconds);
            }
        }
    }
    
    static getConfig(name) {
        return JSON.parse(localStorage.getItem(`config.${name}`));
    }

    static setConfig(name, value) {
        return localStorage.setItem(`config.${name}`, value);
    }
}

class Timer {
    constructor({
        name, seconds = 0, paused = false,
        onTick, onRunning, onPaused, onStopped
    }) {
        if (!name) throw new TimerError('Timer name required.');

        this.id = name;
        this.name = name;
        this.seconds = seconds;
        this.paused = paused;

        this.onTick = () => onTick(
            this.seconds / 3600 >> 0,
            this.seconds % 3600 / 60 >> 0,
            this.seconds % 3600 % 60
        );
        this.onRunning = onRunning;
        this.onPaused = onPaused;
        this.onStopped = onStopped;

        this.init();
    }

    static timers = new Map();
    static clock = setInterval(() => {
        for (let timer of Timer.timers.values()) {
            timer.tick();
        }
    }, 1000);
    static pauseAll () {
        for (let timer of Timer.timers.values()) {
            timer.pause();
        }
    };

    init() {
        if (Timer.timers.has(this.name)) {
            throw new TimerError(`Timer with name ${this.name} already started.`);
        }
        Timer.timers.set(this.id, this);

        this.onTick();
        if (!this.paused) {
            this.run(true);
        }
    }

    run(force) {
        if (this.paused || force) {
            this.paused = false;
            TimerStorage.store(this);

            this.onRunning();
        }
    }

    tick() {
        if (!this.paused) {
            this.seconds++;
            this.onTick();
        }
    }

    pause() {
        if (!this.paused) {
            this.paused = true;
            TimerStorage.store(this);

            this.onPaused();
        }
    }

    stop() {
        if (Timer.timers.has(this.id)) {
            Timer.timers.delete(this.id);
            TimerStorage.discard(this);

            this.onStopped();
        }
    }
}