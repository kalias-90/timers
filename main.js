document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('newTimerName');
    const timersContainer = document.getElementById('timers');
    const timerTemplate = document.getElementById('timerTemplate');
    const errorMessage = document.getElementById('errorMessage');
    const pauseOthersFlag = document.getElementById('pauseOthers');
    const timerCreate = document.getElementById('createTimer');
    const pauseAllButton = document.getElementById('pauseAll');
    const stopAllButton = document.getElementById('stopAll');
    const logsContainer = document.getElementById('logs');
    const logTemplate = document.getElementById('logTemplate');
    const clearLogsButton = document.getElementById('clearLogs');

    const clearErrorMessage = () => {
        errorMessage.textContent = '';
    }
    const showErrorMessage = (message) => {
        clearErrorMessage();
        errorMessage.textContent = message;
    };
    const timeToString = (time = 0) => {
        return `${time / 3600 >> 0}h ${time % 3600 / 60 >> 0}m ${time % 3600 % 60}s`
    };
    const refreshLogs = () => {
        logsContainer.innerHTML = '';
        Storage.getAll(Storage.TYPE_NAMES.LOG)
            .sort((a, b) => a.stopDate - b.stopDate)
            .forEach(({ name, startDate, stopDate, time }) => {
                const logElement = document.createElement('li');
                logElement.innerHTML = logTemplate.innerHTML
                    .replace('${startDate}', (new Date(startDate)).toLocaleString())
                    .replace('${stopDate}', (new Date(stopDate)).toLocaleString())
                    .replace('${name}', name)
                    .replace('${time}', timeToString(time));
                logsContainer.prepend(logElement);
            });
    };
    const renderTimer = (timer) => {
        const timerElement = document.createElement('li');
        timerElement.innerHTML = timerTemplate.innerHTML
            .replace('${timerName}', timer.name)
            .replace('${time}', timeToString(timer.time));
        if (timer.paused) {
            timerElement.classList.add('paused');
        }
        timersContainer.prepend(timerElement);

        const timeLabel = timerElement.querySelector('span.time');
        const tick = () => timeLabel.textContent = timeToString(timer.time);
        Clock.subscribe(tick);

        timerElement.querySelector('button.resume').addEventListener('click', (e) => {
            clearErrorMessage();
            timer.run();
            timerElement.classList.remove('paused');
        });
        timerElement.querySelector('button.pause').addEventListener('click', (e) => {
            clearErrorMessage();
            timer.pause();
            timerElement.classList.add('paused');
        });
        timerElement.querySelector('button.stop').addEventListener('click', (e) => {
            clearErrorMessage();

            timer.stop();
            Clock.unsubscribe(tick);

            timerElement.remove();
            refreshLogs();
        });
    }
    
    pauseOthersFlag.checked = Storage.get(Storage.TYPE_NAMES.CONFIG, 'pauseOthers') !== false;
    pauseOthersFlag.addEventListener('change', () => {
        Storage.save(Storage.TYPE_NAMES.CONFIG, 'pauseOthers', pauseOthersFlag.checked);
    });

    const timers = Timer.restore();
    timers.forEach(renderTimer);
    const pauseAll = () => {
        timers.forEach((t) => t.pause());
        const children = timersContainer.childNodes;
        for (var i = 0; i < children.length; ++i) {
            children[i].classList.add('paused');
        }
    };
    timerCreate.addEventListener('click', () => {
        clearErrorMessage();

        const name = nameInput.value;
        nameInput.value = '';

        try {
            const timer = new Timer({ name });
            if (pauseOthersFlag.checked) {
                pauseAll();
            }
            timer.run();
            renderTimer(timer);

            timers.push(timer);
        } catch (error) {
            if (error instanceof TimerError) {
                showErrorMessage(error.message);
            } else {
                throw error;
            }
        }

    });
    pauseAllButton.addEventListener('click', pauseAll);
    stopAllButton.addEventListener('click', () => {
        timers.forEach((t) => t.stop());
        while (timersContainer.firstChild) {
            timersContainer.removeChild(timersContainer.firstChild);
        }
        refreshLogs();
    });

    refreshLogs();
    clearLogsButton.addEventListener('click', () => {
        Storage.removeAll(Storage.TYPE_NAMES.LOG);
        refreshLogs();
    });
});