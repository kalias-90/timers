document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('newTimerName');
    const timersContainer = document.getElementById('timers');
    const timerTemplate = document.getElementById('timerTemplate');
    const timerCreate = document.getElementById('createTimer');
    const errorMessage = document.getElementById('errorMessage');
    const pauseOthersFlag = document.getElementById('pauseOthers');

    const clearErrorMessage = () => {
        errorMessage.textContent = '';
    }
    const showErrorMessage = (message) => {
        clearErrorMessage();
        errorMessage.textContent = message;
    };

    const createTimer = (name, paused = false, seconds = 0) => {
        const timerElement = document.createElement('li');
        timerElement.classList.add('timer');
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
                paused,
                seconds,
                onTick: (h, m, s) => {
                    timeLabel.textContent = `${h}h ${m}m ${s}s`;
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

    pauseOthersFlag.checked = TimerStorage.getConfig(TimerConfigs.PAUSE_OTHERS) !== false;

    pauseOthersFlag.addEventListener('change', () => {
        TimerStorage.setConfig(TimerConfigs.PAUSE_OTHERS, pauseOthersFlag.checked);
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
});