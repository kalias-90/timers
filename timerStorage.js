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

    static restore (restoreHandler) {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('timer.')) {
                let { name, seconds, paused, startDate, lastDate } = JSON.parse(localStorage.getItem(key));

                if (!paused) {
                    const now = (new Date());
                    seconds += Math.round((now.getTime() - lastDate)/1000);
                };

                restoreHandler(name, new Date(startDate), paused, seconds);
            }
        }
    }

    static getLogs() {
        const result = new Set();
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('log.')) {
                let { name, time, startDate, stopDate } = JSON.parse(localStorage.getItem(key));

                result.add({
                    startDate: new Date(startDate),
                    stopDate: new Date(stopDate),
                    name,
                    time
                });
            }
        }
        return Array.from(result);
    }

    static clearLogs() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('log.')) {
                localStorage.removeItem(key);
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