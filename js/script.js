let currentSong = new Audio();
let songs;
let currFolder;
let uploadButtonAdded = false;
let recommendButtonAdded = false;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {

    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text()

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []
    for (let index = 0; index < as.length; index++) {

        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // play the first song

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 

                <img class="invert" src="img/music.svg" alt="">
                    <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                        <div>Song Artist</div>                        
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="img/play.svg" alt="">
                    </div>
            </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs

}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {

    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    let array = Array.from(anchors)
    for (index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            // console.log(e.href)

            let folder = e.href.split("/").slice(-2)[1]
            // get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `
                                <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http:/www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000"  stroke-width="1.5"
                                stroke-linejoin="round"/></svg>
                        </div>
                        <img height="150px" width="100px" src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    // load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })

}

async function main() {

    // Get the list of all the songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    // display all the albums on the page
    await displayAlbums()

    // Attach an event listener to play next and previous buttons
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + '%';
    })

    // add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + '%';
        currentSong.currentTime = (currentSong.duration) * percent / 100;


    })

    // add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    //add an event listener for close button
    document.querySelector(".close").addEventListener("click", e => {
        document.querySelector(".left").style.left = "-120%";
    })

    //add an event listener to previous and next
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // add an event listener for volume button
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume == 0) {

        }
    })

    // add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {

        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

    // add event listener for trending sections
    document.querySelector(".trending-section").addEventListener("click", async e => {

        const recommendButtonDiv = document.getElementById("recommend-btn");

        if (recommendButtonAdded) {
            recommendButtonDiv.remove();
            // Reset the flag to false after the div is removed
            recommendButtonAdded = false;
        }

        const uploadButtonDiv = document.getElementById("upload-btn");

        if (uploadButtonAdded) {
            uploadButtonDiv.remove();
            // Reset the flag to false after the div is removed
            uploadButtonAdded = false;
        }

        await displayAlbums() 
    })

    // add event listener for recommended sections
    document.querySelector(".recommended-section").addEventListener("click", e => {

        const uploadButtonDiv = document.getElementById("upload-btn");

        if (uploadButtonAdded) {
            uploadButtonDiv.remove();
            // Reset the flag to false after the div is removed
            uploadButtonAdded = false;
        }

        // Check if the upload button div has already been added
        if (recommendButtonAdded) {
            return;
        }

        // Create the upload button div
        const recommendButtonDiv = document.createElement("div");
        recommendButtonDiv.id = "recommend-btn";
        recommendButtonDiv.className = "recommend-button flex justify-center";
        recommendButtonDiv.innerHTML = `<button class="recommendbtn text-white font-bold rounded-md bg-green-600 p-2">Recommend Songs</button>`;

        // Find the parent element where the new div should be inserted
        const parentElement = document.querySelector(".spotify-playlists");

        // Find the reference element (after which the new div should be inserted)
        const referenceElement = document.querySelector(".cardContainer");

        // Insert the new div before the reference element
        parentElement.insertBefore(recommendButtonDiv, referenceElement);

        // Set the flag to true after the div is added
        recommendButtonAdded = true;

        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = "";
    })

    
    // add event listener for upload songs sections
    document.querySelector(".upload-section").addEventListener("click", async e => {

        const recommendButtonDiv = document.getElementById("recommend-btn");

        if (recommendButtonAdded) {
            recommendButtonDiv.remove();
            // Reset the flag to false after the div is removed
            recommendButtonAdded = false;
        }

        // Check if the upload button div has already been added
        if (uploadButtonAdded) {
            return;
        }

        // Create the upload button div
        const uploadButtonDiv = document.createElement("div");
        uploadButtonDiv.id = "upload-btn";
        uploadButtonDiv.className = "upload-button flex justify-center";
        uploadButtonDiv.innerHTML = `
        <button class="uploadbtn text-white font-bold rounded-md bg-green-600 p-2">Upload Songs</button>
    `;

        // Find the parent element where the new div should be inserted
        const parentElement = document.querySelector(".spotify-playlists"); 
        // Find the reference element (after which the new div should be inserted)
        const referenceElement = document.querySelector(".cardContainer");

        // Insert the new div before the reference element
        parentElement.insertBefore(uploadButtonDiv, referenceElement);

        // Set the flag to true after the div is added
        uploadButtonAdded = true;

        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = "";

    })

    // Attach an event listener to each song
    Array.from(document.querySelector(".cardContainer").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
}

main()