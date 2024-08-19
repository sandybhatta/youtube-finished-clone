const API_KEY = "AIzaSyBvsf6Dfcl-mkts80OXqNXtleRRA63-GxA";
const BASE_URL = "https://www.googleapis.com/youtube/v3";
const header=document.querySelector("body")
const input = document.getElementById("search-input");
const mainDiv = document.getElementById('result-container');
input.value = localStorage.getItem("userSearchedContent");







let inputSuggestionContainer=document.createElement("div")
inputSuggestionContainer.className="suggestion-container"


let handleSearch = myDebouncing(fetchAndDisplayVideos);
let searchIcon=document.querySelector('.seach-icon')





function handleListDemo(dataList) {
    // Get or create the suggestion container
    let inputSuggestionContainer = document.querySelector(".suggestion-container");
    
    // Remove old suggestions if they exist
    if (inputSuggestionContainer) {
        inputSuggestionContainer.remove();
    }

    // Create a new suggestion container
    inputSuggestionContainer = document.createElement("div");
    inputSuggestionContainer.className = "suggestion-container";
    
    // Create and append new suggestion elements
    let searchListTitles = dataList.map(ele => ele.snippet.title);
    for (let i = 0; i < 8; i++) {
        const inputSuggestionDiv = document.createElement("div");
        inputSuggestionDiv.setAttribute("class", "input-suggestion");
        inputSuggestionDiv.innerText = searchListTitles[i];
        inputSuggestionDiv.addEventListener("click", () => {
            input.value = inputSuggestionDiv.innerText;
            inputSuggestionContainer.remove(); // Remove suggestions after selection
        });
        inputSuggestionContainer.append(inputSuggestionDiv);
    }

    // Append the new suggestions to the header
    header.append(inputSuggestionContainer);
}


async function fetchAndDisplayVideos(searchQuery, maxResults) {
    let dataArray = await fetchVideos(searchQuery, maxResults);
  
        handleListDemo(dataArray.items);
    
}

function myDebouncing(func, delay = 400) {
    let id;
    return function(...args) {
        clearTimeout(id);
        id = setTimeout(() => {
            func(...args);
        }, delay);
    };
}




input.addEventListener("input", (e) => {
    handleSearch(input.value.toLowerCase().trim(), 25);
});
input.addEventListener('keyup',e=>{
    if(e.key=="Enter"){
localStorage.setItem("userSearchedContent",input.value)
    window.location.href="./results.html"
    }
})


searchIcon.addEventListener('click',()=>{
    if(input.value){
        localStorage.setItem("userSearchedContent",input.value)
        window.location.href="./results.html"
    }
})























async function displayResult() {
    let fetchedResult = await fetchVideos(input.value, 25);
    let searchedResult = fetchedResult.items;

    // Fetch channel results
    let channelResult = await fetchChannels(input.value);

    if (channelResult.items.length > 0) {
        // Channel found
        const channelId = channelResult.items[0].id.channelId;
        let channelDetails = await fetchChannelLogo(channelId);

        renderUi(true, channelDetails, searchedResult);
    } else {
        // Handle video search results if no channel is found
        renderUi(false, null, searchedResult);
    }
}

displayResult();

function renderUi(isChannelFound, channelDetails, searchedResult) {
    // Clear previous results
    mainDiv.innerHTML = '';
   
    // Render the channel block if a channel is found
    if (isChannelFound && channelDetails) {
        // console.log(channelDetails);
        const channelDiv = document.createElement('div');
        channelDiv.className = "channel-container";
        
        const logoDiv = document.createElement('div');
        logoDiv.className = "logo-container";
        
        const contentDiv = document.createElement("div");
        contentDiv.className = "content-container";
        contentDiv.innerHTML = `
            <h2 class="channel-title">${channelDetails.items[0].snippet.title}</h2>
            <span class="sec-channel-title">${channelDetails.items[0].snippet.customUrl}</span>
            <span class="sec-channel-title">${ formatNumber(channelDetails.items[0].statistics.subscriberCount )} subscribers</span>
            <p class="summary-description">${channelDetails.items[0].snippet.description.slice(0, 150)}...</p>
        `;

        const channelLogo = document.createElement('div');
        channelLogo.className = "image-holder";
        channelLogo.style.background = `url(${channelDetails.items[0].snippet.thumbnails.high.url}) no-repeat center center/cover`;

        logoDiv.append(channelLogo);
        channelDiv.append(logoDiv);
        channelDiv.append(contentDiv);
        channelDiv.addEventListener("click",()=>{
            // localStorage.clear()
            localStorage.setItem("selectedChannelId", channelDetails.items[0].id)
            window.location.href="channelPage.html"
        })
        
        mainDiv.append(channelDiv);
    }

    searchedResult
        .filter(video => video.id.videoId)  
        .forEach(async (video) => {
            
            let channelLogo=await fetchChannelLogo(video.snippet.channelId)
            let videoStats=await fetchVideoStats(video.id.videoId)
            let duration=formatDuration(videoStats.items[0].contentDetails.duration)
           let videoDuration=document.createElement('div')
           videoDuration.className="duration-container"
           videoDuration.innerText=duration
            let channelLogoPicUrl=channelLogo.items[0].snippet.thumbnails.default.url


            const videoDiv = document.createElement("div");
            videoDiv.className = "channel-container";
            
            
            const videoLogo = document.createElement('div');
            videoLogo.className = 'logo-container';
            
            const videoTitleContainer = document.createElement('div');
            videoTitleContainer.className = 'content-container';
            
            
            const videoThumbnail = document.createElement('div')
            videoThumbnail.className = "video-holder";
            videoThumbnail.style.background = `url(${video.snippet.thumbnails.high.url}) no-repeat center center/cover`

            videoTitleContainer.innerHTML = `
                <h2 class="video-title">${video.snippet.title}</h2>
                <img src=${channelLogoPicUrl}>
                <span class="video-channel-title">${video.snippet.channelTitle}</span>
                <div class="video-description">${video.snippet.description}</div>
            `



            videoLogo.append(videoThumbnail);
            videoLogo.append(videoDuration);
            videoDiv.append(videoLogo);
            
            videoDiv.append(videoTitleContainer);

            

            mainDiv.append(videoDiv);
            videoDiv.addEventListener('click', () => {
                // localStorage.clear()
                const videoData = {0: "result", 1: video.id.videoId};
                localStorage.setItem("selectedVideoId", JSON.stringify(videoData))
                window.location.href="videoDetails.html"
            });
        });
}




function formatNumber(number) {
    if (number >= 1000000000) {
        // Billions
        return roundToTwoDecimals(number / 1000000000) + 'B';
    } else if (number >= 1000000) {
        // Millions
        return roundToTwoDecimals(number / 1000000) + 'M';
    } else if (number >= 1000) {
        // Thousands
        return roundToTwoDecimals(number / 1000) + 'K';
    } else {
        // Less than a thousand
        return number.toString();
    }
}

function roundToTwoDecimals(num) {
    return Math.round(num * 100) / 100;
}



























async function fetchVideos(searchQuery, maxResults) {
    try {
        const response = await fetch(
            BASE_URL +
            "/search" +
            `?key=${API_KEY}` +
            `&part=snippet` +
            `&q=${searchQuery}` +
            `&maxResults=${maxResults}`
        );
        const data = await response.json();
        return data;
    } catch (e) {
        console.log(e);
    }
}

async function fetchChannels(searchQuery) {
    try {
        const response = await fetch(
            BASE_URL +
            "/search" +
            `?key=${API_KEY}` +
            `&part=snippet` +
            `&q=${searchQuery}` +
            `&type=channel`
        );
        const data = await response.json();
        return data;
    } catch (e) {
        console.log(e);
    }
}

async function fetchChannelLogo(channelId) {
    try {
        const response = await fetch(
            BASE_URL +
            "/channels" +
            `?key=${API_KEY}` +
            `&part=snippet,statistics` +
            `&id=${channelId}`
        );
        const data = await response.json();
        return data;
    } catch (e) {
        console.log(e);
    }
}




function formatDuration(duration) {
    // Initialize variables to store hours, minutes, and seconds
    let hours = 0, minutes = 0, seconds = 0;

    // Find the index of 'H', 'M', and 'S' in the duration string
    const hIndex = duration.indexOf('H');
    const mIndex = duration.indexOf('M');
    const sIndex = duration.indexOf('S');
    let time=""
    // Extract hours if 'H' is found
    if (hIndex !== -1) {
        // The number part before 'H'
        const hoursPart = duration.slice(2, hIndex);
        hours = parseInt(hoursPart);
        time+=hours+":"
    }

    // Extract minutes if 'M' is found
    if (mIndex !== -1) {
        // If hours are present, minutes start after 'H', otherwise after 'PT'
        const start = hIndex !== -1 ? hIndex + 1 : 2;
        const minutesPart = duration.slice(start, mIndex);
        minutes = parseInt(minutesPart);
        time+=minutes+":"
        
    }

    // Extract seconds if 'S' is found
    if (sIndex !== -1) {
        // If minutes are present, seconds start after 'M', otherwise after 'H'
        const start = mIndex !== -1 ? mIndex + 1 : (hIndex !== -1 ? hIndex + 1 : 2);
        const secondsPart = duration.slice(start, sIndex);
        seconds = parseInt(secondsPart);
        time+=seconds
    }

    // Format the result
    
    return time;
}

// // BASE_URL/videos=>views/duration
// // typeOfDetails=> "contentDetails"=>duration
// // typeOfDetails=> "statistics"=>viewCount

async function fetchVideoStats(videoId){
    try{
        const response=await fetch(
            BASE_URL+
            "/videos"+
            `?key=${API_KEY}`+
            `&part=contentDetails`+
            `&id=${videoId}`
        )
        const data= await response.json()
        return data
    }
    catch(e){
        console.log(e)
    }
}
