document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('newTimerName');
    const timersContainer = document.getElementById('timers');
    const timerTemplate = document.getElementById('timerTemplate');
    const timerCreate = document.getElementById('createTimer');
    const errorMessage = document.getElementById('errorMessage');

    const clearErrorMessage = () => {
        errorMessage.textContent = '';
    }
    const showErrorMessage = (message) => {
        clearErrorMessage();
        errorMessage.textContent = message;
    };

    timerCreate.addEventListener('click', () => {
        clearErrorMessage();

        const name = nameInput.value;
        nameInput.value = '';

        const timerElement = document.createElement('li');
        timerElement.class = 'timer';
        timerElement.innerHTML = timerTemplate.innerHTML.replace('${timerName}', name);
        const timeLabel = timerElement.querySelector('span.time');
        const resumeButton = timerElement.querySelector('button.resume');
        const pauseButton = timerElement.querySelector('button.pause');
        const stopButton = timerElement.querySelector('button.stop');

        timersContainer.prepend(timerElement);

        try {
            const timer = new Timer({
                name,
                onTick: (h, m, s) => {
                    timeLabel.textContent = `${h}h ${m}m ${s}s`;
                },
                onResumed: () => timerElement.classList.remove('paused'),
                onPaused: () => timerElement.classList.add('paused'),
                onStopped: () => timerElement.remove()
            });

            resumeButton.addEventListener('click', (e) => {
                clearErrorMessage();
                timer.resume();
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
    });
});