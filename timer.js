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
        pastTime = 0
    }) {
        if (!name) throw new TimerError('Timer name required.');

        this.name = name;
        this.startDate = startDate;
        this.lastRunDate = null;
        this.pastTime = pastTime;
        this.paused = true;

        this.store();
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
            this.lastRunDate = new Date();
            this.paused = false;
            this.store();
        }
    }

    pause () {
        if (!this.paused) {
            this.pastTime = this.time;
            this.lastRunDate = null;
            this.paused = true;
            this.store();
        }
    }

    stop () {
        this.pause();

        Storage.save(Storage.TYPE_NAMES.LOG, this.id, {
            name: this.name,
            startDate: this.startDate.getTime(),
            stopDate: (new Date).getTime(),
            time: this.time
        });
        Storage.remove(Storage.TYPE_NAMES.TIMER, this.id);
    }

    store () {
        Storage.save(Storage.TYPE_NAMES.TIMER, this.id, {
            name: this.name,
            startDate: this.startDate.getTime(),
            ...(!this.paused ? { lastRunDate: this.lastRunDate.getTime() } : {}),
            pastTime: this.pastTime,
            paused: this.paused
        });
    }

    static restore () {
        return Storage.getAll(Storage.TYPE_NAMES.TIMER)
            .sort((a, b) => a.startDate - b.startDate)
            .map(({ name, startDate, lastRunDate, pastTime, paused }) => {
                if (!paused) {
                    pastTime += Math.round(((new Date()) - lastRunDate)/1000);
                }
                const timer = new Timer({
                    name,
                    startDate: new Date(startDate),
                    pastTime
                });
                if (!paused) {
                    timer.run();
                }
                return timer;
            });
    }
}