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
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        let cleanName = decodeURIComponent(song).replace(".mp3", "").split("(")[0].replace(/_/g, " ").trim();

        songUL.innerHTML += `<li><img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div style="display:none">${song}</div>
                                <div>${cleanName}</div>
                               
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let trackPath = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(trackPath);
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
    document.querySelector(".songinfo").innerHTML = cleanName;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    console.log("displaying albums");
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    
    let array = Array.from(anchors);
    let htmlContent = ""; // 1. Build a string first for better performance

    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            // 2. More robust folder name extraction
            let folder = e.href.split("/").filter(Boolean).pop();
            
            try {
                let infoReq = await fetch(`/songs/${folder}/info.json`);
                if (!infoReq.ok) continue; // Skip folders without info.json

                let info = await infoReq.json(); 
                htmlContent += ` <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${info.title}</h2>
                    <p>${info.description}</p>
                </div>`;
            } catch (error) {
                console.warn(`Skipping album ${folder}: Missing or broken info.json`);
            }
        }
    }

    // 3. Inject everything once the loop is finished
    cardContainer.innerHTML = htmlContent;

    // 4. Re-attach click listeners to the new cards
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
    prevBtn.addEventListener("click", () => {
        let currentFile = currentSong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(currentFile);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        } else {
            playMusic(songs[songs.length - 1]); // Wrap to last
        }
    });

    nextBtn.addEventListener("click", () => {
        let currentFile = currentSong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(currentFile);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]); // Wrap to first
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