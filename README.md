# musicPlayer
A fully functional, responsive music streaming web application built with HTML5, CSS3, and Vanilla JavaScript. This project features dynamic playlist loading, a custom-engineered audio controller, and a mobile-first design.


🚀 Features
Dynamic Music Library: Automatically fetches song folders from the server and generates a playlist.

Custom Playbar: Features a real-time seekbar that allows users to jump to any part of a song.

Intelligent Navigation: Includes Play/Pause, Next, and Previous functionality with wrap-around logic.

Volume Control: Synchronized volume slider with a one-tap mute/unmute toggle.

Responsive UI: Sticky header for desktop and a sliding hamburger menu for mobile users.

Data-Driven Albums: Uses info.json files within directories to dynamically render album titles and descriptions.

🛠️ Tech Stack
HTML5: Semantic structure for accessibility and SEO.

CSS3: Custom Flexbox grid, sticky positioning, and media queries for responsiveness.

JavaScript (ES6+):

Audio API: To handle media states and playback.

Fetch/Async/Await: To read server directories and metadata.

DOM Manipulation: For real-time UI updates.


📁 Project Structure
├── css/
│   ├── style999.css   # Core styling and animations
│   └── utility.css    # Reusable utility classes
├── js/
│   └── script123.js   # Main application logic
├── songs/             # Music repository
│   ├── album-name/
│       ├── info.json  # Metadata for the album
│       ├── cover.jpg  # Album art
│       └── song.mp3   # Audio files
└── index.html         # Main entry point



🤝 Contributing
Contributions, issues, and feature requests are welcome!
