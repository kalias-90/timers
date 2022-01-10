class TimerStorage {
    static get configNames () {
        return {
            PAUSE_OTHERS: 'pauseOthers'
        };
    }

    static store (timer) {
        localStorage.setItem(`timer.${timer.id}`, JSON.stringify({
            name: timer.name,
            seconds: timer.seconds,
            paused: timer.paused,
            startDate: timer.startDate.getTime(),
            lastDate: (new Date()).getTime()
        }));
    }

    static discard (timer) {
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

            if (!storedTimer.paused) {
                const now = new Date();
                storedTimer.seconds += Math.round(((new Date()).getTime() - storedTimer.lastDate)/1000);
            };

            storedTimer.startDate = new Date(storedTimer.startDate);
            storedTimer.lastDate = new Date(storedTimer.lastDate);

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