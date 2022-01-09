class TimerError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TimerError';
    }
}
class Timer {
    constructor({
        name, startDate = new Date(), seconds = 0, paused = false,
        onTick, onRunning, onPaused, onStopped
    }) {
        if (!name) throw new TimerError('Timer name required.');

        this.startDate = startDate || new Date();
        this.name = name;
        this.seconds = seconds;
        this.paused = paused;

        this.onTick = onTick;
        this.onRunning = onRunning;
        this.onPaused = onPaused;
        this.onStopped = onStopped;

        this.init();
    }

    get id () {
        return `${this.startDate.getTime()}-${this.name}`;
    }

    get time () {
        return `${this.seconds / 3600 >> 0}h ${this.seconds % 3600 / 60 >> 0}m ${this.seconds % 3600 % 60}s`
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

    static stopAll () {
        for (let timer of Timer.timers.values()) {
            timer.stop();
        }
    };

    init() {
        if (Timer.timers.has(this.id)) {
            throw new TimerError(`Same timer already exists.`);
        }
        Timer.timers.set(this.id, this);

        this.onTick(this.time);
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
            this.onTick(this.time);
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