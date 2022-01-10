class TimerError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TimerError';
    }
}
class Timer {
    constructor({
        name,
        startDate = new Date(),
        lastRunDate = null,
        pastTime = 0,
        paused = true,
        onTick, onRunning, onPaused, onStopped
    }) {
        if (!name) throw new TimerError('Timer name required.');
        //TODO throw new TimerError('Same timer already exists.');

        this.startDate = startDate;
        this.lastRunDate = lastRunDate;
        this.name = name;
        this.pastTime = pastTime;
        this.paused = paused;

        this.onTick = onTick;
        this.onRunning = onRunning;
        this.onPaused = onPaused;
        this.onStopped = onStopped;

        this.clockHandler = () => {
            if (!this.paused) {
                this.onTick(this.time);
            }
        };
        Clock.subscribe(this.clockHandler);
        Storage.storeTimer(this);
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

    run () {
        if (this.paused) {
            this.lastRunDate = new Date(); //fail when restore
            this.paused = false;
            Storage.storeTimer(this);
        }
        this.onRunning();
    }

    pause () {
        if (!this.paused) {
            this.pastTime = this.time;
            this.lastRunDate = null;
            this.paused = true;
            Storage.storeTimer(this);
        }
        this.onPaused();
    }

    stop () {
        this.pause();
        Clock.unsubscribe(this.clockHandler);
        Storage.discardTimer(this);
        this.onStopped();
    }
}