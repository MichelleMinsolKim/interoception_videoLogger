document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form'); // Form element
    const currentDateInput = document.getElementById('current-date'); // Hidden input for the date

    // Get the current date in ISO format (YYYY-MM-DD) and set it in the hidden input
    const currentDate = new Date().toISOString().slice(0, 10); // Extract only the date part
    currentDateInput.value = currentDate;

    // Add event listener for form submission
    loginForm.addEventListener('submit', (event) => {
        // Get the Participant Number and Study Block inputs
        const participantNumber = document.getElementById('participant-number').value;
        const studyBlock = document.getElementById('study-block').value;

        // Validate inputs
        if (!participantNumber || !studyBlock) {
            event.preventDefault(); // Prevent form submission if inputs are invalid
            alert('Please fill in both Participant Number and Study Block Number.');
        } else {
            // If inputs are valid, log the values (optional)
            console.log('Form Submitted:', {
                participantNumber,
                studyBlock,
                date: currentDate,
            });

            // The form will now naturally submit to index.html with the data
        }
    });
});
