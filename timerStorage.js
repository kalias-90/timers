class Storage {
    static get configNames () {
        return {
            PAUSE_OTHERS: 'pauseOthers'
        };
    }

    static storeTimer (timer) {
        localStorage.setItem(`timer.${timer.id}`, JSON.stringify({
            name: timer.name,
            pastTime: timer.pastTime,
            paused: timer.paused,
            startDate: timer.startDate.getTime(),
            lastRunDate: (timer.lastRunDate ? timer.lastRunDate.getTime() : null)
        }));
    }

    static discardTimer (timer) {
        localStorage.removeItem(`timer.${timer.id}`);
        localStorage.setItem(`log.${timer.id}`, JSON.stringify({
            name: timer.name,
            startDate: timer.startDate.getTime(),
            time: timer.time,
            stopDate: (new Date).getTime()
        }));
    }

    static getStoredTimers () {
        const storedTimerKeys = Object.keys(localStorage).filter((k) => k.startsWith('timer.'));
        return storedTimerKeys.map((key) => {
            const storedTimer = JSON.parse(localStorage.getItem(key));

            storedTimer.startDate = new Date(storedTimer.startDate);
            storedTimer.lastRunDate = (storedTimer.lastRunDate ? new Date(storedTimer.lastRunDate) : null);

            return storedTimer;
        }).sort((a, b) => a.startDate - b.startDate);
    }

    static getLogs() {
        const logKeys = Object.keys(localStorage).filter((k) => k.startsWith('log.'));
        return logKeys.map((key) => {
            const log = JSON.parse(localStorage.getItem(key));
            log.startDate = new Date(log.startDate);
            log.stopDate = new Date(log.stopDate);
            return log;
        }).sort((a, b) => a.stopDate - b.stopDate);
    }

    static clearLogs() {
        const logKeys = Object.keys(localStorage).filter((k) => k.startsWith('log.'));
        logKeys.forEach((key) => localStorage.removeItem(key));
    }
    
    static getConfig(name) {
        return JSON.parse(localStorage.getItem(`config.${name}`));
    }

    static setConfig(name, value) {
        return localStorage.setItem(`config.${name}`, value);
    }
}