class TimerError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TimerError';
    }
}

class Timer {
    constructor({
        name, onTick, onResumed, onPaused, onStopped
    }) {
        if (!name) {
            throw new TimerError('Timer name required.');
        }

        this.name = name;
        this.seconds = 0;
        this.paused = true;
        this.onTick = () => onTick(
            this.seconds / 3600 >> 0,
            this.seconds % 3600 / 60 >> 0,
            this.seconds % 3600 % 60
        );
        this.onResumed = onResumed;
        this.onPaused = onPaused;
        this.onStopped = onStopped;

        this.start();
    }

    static pauseOnStart = true;
    static timers = new Map();
    static clock = setInterval(() => {
        for (let timer of Timer.timers.values()) {
            timer.tick();
        }
    }, 1000);

    start() {
        if (Timer.timers.has(this.name)) {
            throw new TimerError(`Timer with name ${this.name} already started.`);
        }
        if (Timer.pauseOnStart) {
            for (let timer of Timer.timers.values()) {
                timer.pause();
            }
        }
        Timer.timers.set(this.name, this);

        this.onTick();
        this.resume();
    }

    resume() {
        if (this.paused) {
            this.paused = false;
            this.onResumed();
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
            this.onPaused();
        }
    }

    stop() {
        if (Timer.timers.has(this.name)) {
            Timer.timers.delete(this.name);
            this.onStopped();
        }
    }
}