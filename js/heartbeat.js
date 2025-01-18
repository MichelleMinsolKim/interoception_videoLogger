document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const userInputContainer = document.getElementById('user-input-container');
    const heartbeatInput = document.getElementById('heartbeat-input');
    const submitHeartbeat = document.getElementById('submit-heartbeat');
    const instructionText = document.querySelector('#heartbeat-container h1'); // Reference to the instruction text

    // Extract participant data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const participantNumber = urlParams.get('participant');
    const studyBlock = urlParams.get('studyBlock');
    const date = urlParams.get('date');

    if (!participantNumber || !studyBlock || !date) {
      console.error('Missing participant data.');
    } else {
      console.log('Participant Data:', {
        participantNumber,
        studyBlock,
        date,
      });
    }

    const logData = [];
    let measurementStartTime = null;

    startButton.addEventListener('click', () => {
      console.log('Heartbeat measurement started');
      startButton.style.display = 'none'; // Hide the start button
      instructionText.textContent = 'Start counting for 30 seconds!'; // Update the instruction text
      measurementStartTime = new Date(); // Record the start time
      startCountdown(30); // Start the countdown from 30 seconds
    });

    function startCountdown(seconds) {
      setTimeout(() => {
        console.log('Countdown finished!');
        instructionText.textContent = '30 seconds passed! Stop your Count'; // Update the instruction text
        userInputContainer.style.display = 'flex'; // Show the input container
      }, seconds * 1000); // Wait for the countdown duration
    }

    submitHeartbeat.addEventListener('click', () => {
      const heartbeatValue = heartbeatInput.value;

      if (heartbeatValue && !isNaN(heartbeatValue)) {
        console.log('User-entered heartbeat value:', heartbeatValue);
        alert(`Thank you! The session has ended. \n Please find the study coordinator for further assistance.`); //Your heartbeat value is ${heartbeatValue}.

        const startTimeEST = convertToEST(measurementStartTime);

        logData.push({
          startTimeEST,
          heartbeatValue,
        });

        console.log('Logged data:', logData);

        // Automatically download the CSV file
        downloadLogData();
      } else {
        alert('Please enter a valid numerical value for your heartbeat.');
      }
    });

    function convertToEST(date) {
      const offset = -5; // EST is UTC-5
      return new Date(date.getTime() + offset * 60 * 60 * 1000)
        .toISOString()
        .replace('T', ' ')
        .slice(0, 19) + ' EST';
    }

    function downloadLogData() {
      const fileName = `Participant_${participantNumber}_Study_${studyBlock}_${date}_heartbeat.csv`;

      const csvContent = [
        ['Start Time (EST)', 'Heartbeat Value'],
        ...logData.map(entry => [
          entry.startTimeEST,
          entry.heartbeatValue,
        ]),
      ]
        .map(row => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();

      console.log(`Log data saved as ${fileName}`);
    }
});

//coda.io