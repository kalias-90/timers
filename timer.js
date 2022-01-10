const CLOCK_ACCURACY = 1000;
class TimerError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TimerError';
    }
}
class Timer {
    static timers = new Map();
    static clock = setInterval(() => {
        for (let timer of Timer.timers.values()) {
            timer.onTick(timer.time);
        }
    }, CLOCK_ACCURACY);

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

    constructor({
        name,
        startDate = new Date(),
        lastRunDate = null,
        pastTime = 0,
        paused = false,
        onTick, onRunning, onPaused, onStopped
    }) {
        if (!name) throw new TimerError('Timer name required.');

        this.startDate = startDate;
        this.lastRunDate = lastRunDate;
        this.name = name;
        this.pastTime = pastTime;
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
        let lastIntrerval = 0;
        if (!this.paused) {
            lastIntrerval = Math.round(((new Date()) - this.lastRunDate)/1000);
        }
        return this.pastTime + lastIntrerval;
    }

    init() {
        if (Timer.timers.has(this.id)) {
            throw new TimerError(`Same timer already exists.`);
        }
        Timer.timers.set(this.id, this);

        if (!this.paused) {
            if (!this.lastRunDate) {
                this.lastRunDate = new Date();
            }
            TimerStorage.storeTimer(this);
        }
    }

    run() {
        if (this.paused) {
            this.lastRunDate = new Date();
            this.paused = false;
            TimerStorage.storeTimer(this);
        }
        this.onRunning();
    }

    pause() {
        if (!this.paused) {
            this.pastTime = this.time;
            this.lastRunDate = null;
            this.paused = true;
            TimerStorage.storeTimer(this);
        }
        this.onPaused();
    }

    stop() {
        this.pause();
        if (Timer.timers.has(this.id)) {
            Timer.timers.delete(this.id);
            TimerStorage.discardTimer(this);
        }
        this.onStopped();
    }
}