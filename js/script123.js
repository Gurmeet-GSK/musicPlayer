console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs = [];
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;

    //Fetch the list.json
    let a = await fetch(`${folder}/list.json`);
    songs = await a.json(); // Now 'songs' is the array of clean filenames

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    // Add songs to the left-side playlist
    for (const song of songs) {
        //clean the display name for UI, but keep 'song' (with .mp3) for logic
        let cleanDisplayName = song.replace(".mp3", "").replaceAll("%20", " ");

        songUL.innerHTML += `<li><img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div style="display:none">${song}</div> 
                                <div>${cleanDisplayName}</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
    }

    //Attach click event to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            // This gets the hidden filename (e.g., "Song.mp3") from the innerHTML
            let track = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(track);
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track; 
    if (!pause) {
        currentSong.play(); 
        document.querySelector("#play").src = "img/pause.svg";
    }
    let cleanName = decodeURIComponent(track).replace(".mp3", "").split("(")[0].trim();
    
    document.querySelector(".songinfo").innerHTML = `<span class="scrolling-text">${cleanName}</span>`; 
    
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    console.log("displaying albums");

    let a = await fetch(`songs/songs.json`);
    let folders = await a.json();

    let cardContainer = document.querySelector(".cardContainer");
    let htmlContent = "";

    // Loop through the folders found in json
    for (const folder of folders) {
        try {
            let infoReq = await fetch(`songs/${folder}/info.json`);
            if (!infoReq.ok) continue;

            let info = await infoReq.json();
            htmlContent += ` <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                    </svg>
                </div>
                <img src="songs/${folder}/cover.jpg" alt="">
                <h2>${info.title}</h2>
                <p>${info.description}</p>
            </div>`;
        } catch (error) {
            console.error(`Skipping ${folder} due to error:`, error);
        }
    }

    cardContainer.innerHTML = htmlContent;

    //attach listeners to newly created cards
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    await getSongs("songs/mixSongs");
    playMusic(songs[0], true);
    await displayAlbums();

    // Selectors
    const playBtn = document.querySelector("#play");
    const prevBtn = document.querySelector("#previous");
    const nextBtn = document.querySelector("#next");

    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = "img/pause.svg";
        } else {
            currentSong.pause();
            playBtn.src = "img/play.svg";
        }
    });

    // TimeUpdate Function
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });


    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Close when clicking anywhere on the right panel
    document.querySelector(".right").addEventListener("click", (e) => {

        if (!e.target.classList.contains("hamburger")) {
            document.querySelector(".left").style.left = "-120%";
        }
    });



    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Wrap-around Next/Prev Logic
    nextBtn.addEventListener("click", () => {
        let currentFile = decodeURI(currentSong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentFile);

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]);
        }
    });

    prevBtn.addEventListener("click", () => {
        let currentFile = decodeURI(currentSong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentFile);

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        } else {
            playMusic(songs[songs.length - 1]);
        }
    });

    // Volume Logic
    document.querySelector(".range input").addEventListener("input", (e) => {
        let volumeValue = parseInt(e.target.value);
        currentSong.volume = volumeValue / 100;

        let volImg = document.querySelector(".volume img");

        if (volumeValue > 0) {
            volImg.src = volImg.src.replace("img/mute.svg", "img/volume.svg");
        } else {
            volImg.src = volImg.src.replace("img/volume.svg", "img/mute.svg");
        }
    });

    document.querySelector(".volume img").addEventListener("click", e => {
        let rangeInput = document.querySelector(".range input");

        if (e.target.src.includes("img/volume.svg")) {
            // Muting
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            currentSong.volume = 0;
            rangeInput.value = 0;
        } else {
            // Unmuting
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            currentSong.volume = 0.5;
            rangeInput.value = 10;
        }
    });

    // Auto-play next song
    currentSong.addEventListener("ended", () => nextBtn.click());
}

main();