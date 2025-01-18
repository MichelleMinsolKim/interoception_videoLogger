document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('dollyzoom');
  const ratingPanel = document.getElementById('rating-panel');
  const valenceSlider = document.getElementById('valence-slider');
  const arousalSlider = document.getElementById('arousal-slider');
  const vibrationSpeedSlider = document.getElementById('vibration-speed-slider');
  const submitButton = document.getElementById('submit-emotion');

  const urlParams = new URLSearchParams(window.location.search);
  const participantNumber = urlParams.get('participant');
  const studyBlock = parseInt(urlParams.get('studyBlock'));
  const date = urlParams.get('date');

  if (!participantNumber || !studyBlock || !date) {
    console.error('Missing participant data. Log file generation may fail.');
  }

  // Change label content if studyBlock is 3
  if (studyBlock === 3) {
    const vibrationSpeedLabel = document.querySelector('label[for="vibration-speed-slider"]');
    if (vibrationSpeedLabel) {
      vibrationSpeedLabel.textContent = "How fast is your current heartbeat compared to before?";
    }
  }

  let videoList;
  switch (studyBlock) {
    case 1:
      videoList = [
        { src: './assets/films/Fear/the_Shining_en.mp4', scenes: [0, 127, 255] },
        { src: './assets/films/Amusement/there_is_something_about_Marry_1_en.mp4', scenes: [88, 175] },
        { src: './assets/films/Fear/the_Exorcist_en.mp4', scenes: [50, 101] },
      ];
      break;
    case 2:
      videoList = [
        { src: './assets/films/Fear/the_Blair_Witch_Project_en.mp4', scenes: [0, 118, 237] },
        { src: './assets/films/Amusement/a_Fish_Called_Wanda_en.mp4', scenes: [86, 173] },
        { src: './assets/films/Fear/seven_2_en.mp4', scenes: [51, 103] },
        { src: './assets/films/Fear/chucky_2_en.mp4', scenes: [32, 65] },
      ];
      break;
    case 3:
      videoList = [
        { src: './assets/films/Fear/copycat_en.mp4', scenes: [0, 71, 143] },
        { src: './assets/films/Amusement/when_Harry_Met_Sally_en.mp4', scenes: [82, 165] },
        { src: './assets/films/Fear/misery_en.mp4', scenes: [105, 211] },
      ];
      break;
    default:
      console.error('Invalid studyBlock. Defaulting to an empty video list.');
      videoList = [];
  }

  let currentVideoIndex = 0;
  let logData = [];
  let entryOrder = 0;
  let ratingStages = [];
  let blockStart = true;

  const loadVideo = () => {
    if (currentVideoIndex >= videoList.length) {
      console.log('All videos completed. Redirecting...');
      downloadLogData();
      const redirectURL = `heartbeat.html?participant=${encodeURIComponent(participantNumber)}&studyBlock=${encodeURIComponent(studyBlock)}&date=${encodeURIComponent(date)}`;
      window.location.href = redirectURL;
      return;
    }

    const videoDetails = videoList[currentVideoIndex];
    video.src = videoDetails.src;
    video.currentTime = 0;
    ratingStages = videoDetails.scenes.slice();

    console.log(`Loading video: ${videoDetails.src}`);
    if (blockStart) {
      blockStart = false;
      scheduleRating(ratingStages.shift());
    } else {
      video.play().then(() => {
        scheduleRating(ratingStages.shift());
      }).catch(err => console.error('Playback Error:', err));
    }
  };

  const scheduleRating = (time) => {
    if (time === undefined) return;

    const delay = (time - video.currentTime) * 1000;
    if (delay <= 0) {
      triggerRatingPanel();
    } else {
      setTimeout(() => triggerRatingPanel(), delay);
    }
  };

  const triggerRatingPanel = () => {
    video.pause();
    console.log('Pausing video for rating...');
    ratingPanel.classList.add('visible');
  };

  const hideRatingPanel = () => {
    ratingPanel.classList.remove('visible');
  };

  const logRating = () => {
    const currentTime = video.currentTime.toFixed(2);
    const utcTimestamp = new Date();
    const offset = -5;
    const estTimestamp = new Date(utcTimestamp.getTime() + offset * 60 * 60 * 1000)
      .toISOString()
      .replace('T', ' ')
      .slice(0, 19) + ' EST';

    const valence = parseFloat(valenceSlider.value);
    const arousal = parseFloat(arousalSlider.value);
    const vibrationSpeed = parseFloat(vibrationSpeedSlider.value);
    const videoName = videoList[currentVideoIndex].src.split('/').pop();
    entryOrder += 1;

    logData.push({
      timestamp: estTimestamp,
      videoName,
      currentTime,
      valence,
      arousal,
      vibrationSpeed,
      entryOrder,
    });

    console.log('Logged data:', logData);
  };

  const downloadLogData = () => {
    const fileName = `Participant_${participantNumber}_Study_${studyBlock}_${date}.csv`;
    const csvContent = [
      ['Timestamp', 'Video Name', 'Current Time', 'Valence', 'Arousal', 'Vibration Speed', 'Entry Order'],
      ...logData.map(entry => [
        entry.timestamp,
        entry.videoName,
        entry.currentTime,
        entry.valence,
        entry.arousal,
        entry.vibrationSpeed,
        entry.entryOrder
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();

    console.log(`Log data saved as ${fileName}`);
  };

  submitButton.addEventListener('click', () => {
    logRating();
    hideRatingPanel();
    console.log('Rating submitted. Resuming video...');
    video.play().catch(err => console.error('Video play failed:', err));
    if (ratingStages.length > 0) {
      scheduleRating(ratingStages.shift());
    } else if (video.ended) {
      currentVideoIndex++;
      loadVideo();
    }
  });

  video.addEventListener('ended', () => {
    currentVideoIndex++;
    loadVideo();
  });

  loadVideo();
});
