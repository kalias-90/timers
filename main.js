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

    const refreshLogs = () => {
        logsContainer.innerHTML = '';
        for (let { startDate, stopDate, name, time } of TimerStorage.getLogs()) {
            const logElement = document.createElement('li');
            logElement.innerHTML = logTemplate.innerHTML
                .replace('${startDate}', startDate.toLocaleString())
                .replace('${stopDate}', stopDate.toLocaleString())
                .replace('${name}', name)
                .replace('${time}', time);
            logsContainer.append(logElement);
        }
    };

    const createTimer = (name, startDate, paused = false, seconds = 0) => {
        const timerElement = document.createElement('li');
        if (paused) timerElement.classList.add('paused');
        timerElement.innerHTML = timerTemplate.innerHTML.replace('${timerName}', name);

        const timeLabel = timerElement.querySelector('span.time');
        const resumeButton = timerElement.querySelector('button.resume');
        const pauseButton = timerElement.querySelector('button.pause');
        const stopButton = timerElement.querySelector('button.stop');

        timersContainer.prepend(timerElement);

        try {
            const timer = new Timer({
                name,
                startDate,
                paused,
                seconds,
                onTick: (time) => {
                    timeLabel.textContent = time;
                },
                onRunning: () => timerElement.classList.remove('paused'),
                onPaused: () => timerElement.classList.add('paused'),
                onStopped: () => timerElement.remove()
            });

            resumeButton.addEventListener('click', (e) => {
                clearErrorMessage();
                timer.run();
            });
            pauseButton.addEventListener('click', (e) => {
                clearErrorMessage();
                timer.pause();
            });
            stopButton.addEventListener('click', (e) => {
                clearErrorMessage();
                timer.stop();
                refreshLogs();
            });

        } catch (error) {
            if (error instanceof TimerError) {
                showErrorMessage(error.message);
                timerElement.remove();
            } else {
                throw error;
            }
        }
    };

    TimerStorage.restore(createTimer);
    refreshLogs();

    pauseOthersFlag.checked = TimerStorage.getConfig(TimerStorage.configNames.PAUSE_OTHERS) !== false;

    pauseOthersFlag.addEventListener('change', () => {
        TimerStorage.setConfig(TimerStorage.configNames.PAUSE_OTHERS, pauseOthersFlag.checked);
    });
    timerCreate.addEventListener('click', () => {
        clearErrorMessage();

        const name = nameInput.value;
        nameInput.value = '';

        if (pauseOthersFlag.checked) {
            Timer.pauseAll();
        }
        createTimer(name);
    });
    pauseAllButton.addEventListener('click', () => {
        Timer.pauseAll();
    });
    stopAllButton.addEventListener('click', () => {
        Timer.stopAll();
        refreshLogs();
    });
    clearLogsButton.addEventListener('click', () => {
        TimerStorage.clearLogs();
        refreshLogs();
    });

});