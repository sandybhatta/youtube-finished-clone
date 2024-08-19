// // 
document.addEventListener('DOMContentLoaded',()=>{
    displayVideos();
})
const mainContent = document.getElementById("main-content");

const header=document.querySelector("body")
const API_KEY = "AIzaSyBvsf6Dfcl-mkts80OXqNXtleRRA63-GxA";
const BASE_URL = "https://www.googleapis.com/youtube/v3";









let inputSuggestionContainer=document.createElement("div")
inputSuggestionContainer.className="suggestion-container"

const input=document.getElementById("search-input")
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


















async function fetchPopularVideos() {
    const response = await fetch(`${BASE_URL}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&maxResults=20&regionCode=IN&key=${API_KEY}`);
    const data = await response.json();
    // console.log(data.items);
    return data.items;
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

function getDaysAgo(date) {
    const now = new Date();
    const publishedDate = new Date(date);
    const diffTime = Math.abs(now - publishedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

async function displayVideos() {
    const videos = await fetchPopularVideos();
console.log(videos);
    videos.forEach(async (video) => {
        const videoContainer = document.createElement("div");
        videoContainer.setAttribute("class","video-container")






        videoContainer.addEventListener('click',()=>{
            const videoData = {"0": "popular", "1": video.id};
            localStorage.setItem("selectedVideoId", JSON.stringify(videoData))
            window.location.href="videoDetails.html"
        })
        
        const thumbnailContainer = document.createElement("div");
        thumbnailContainer.setAttribute("class","thumbnail-container")
        const thumbnailImg = document.createElement("div");
        thumbnailImg.setAttribute("class","thumbnail-img")
        const videoDurationContainer = document.createElement("div");
        videoDurationContainer.setAttribute("class","video-duration")
        const titleContainer = document.createElement("div");
        titleContainer.setAttribute("class","title-container")
        const channelTitle= document.createElement("div")
        channelTitle.setAttribute("class","channel-title")
        const channelImg= document.createElement("div")
        channelImg.setAttribute("class","channel-img")
        
        


        const title = video.snippet.title;
        const duration = formatDuration(video.contentDetails.duration);
        const channelName = video.snippet.channelTitle;
        const viewCount = video.statistics.viewCount;
        const publishedAt = video.snippet.publishedAt;
        const daysAgo = getDaysAgo(publishedAt);
        const thumbnailUrl = video.snippet.thumbnails.high.url;

        // Style the thumbnail container
        thumbnailImg.style.background = `url(${thumbnailUrl}) no-repeat center center/cover`;
        thumbnailContainer.append(thumbnailImg)
        
    
        videoDurationContainer.innerText = duration;
        thumbnailContainer.append(videoDurationContainer)
        

        channelTitle.innerHTML=`
        
        
        <span class="title">${title}</span>
        <div class="veiwers-div">
        <h3 class="sec-title">${channelName}</h3>
        <span class="sec-title">${viewCount} views</span>
        <span class="sec-title">${daysAgo} days ago</span>
        </div>
        `
        const channelLogo=await fetchChannelLogo(video.snippet.channelId)
        
        const channeLogoPicURL=channelLogo.items[0].snippet.thumbnails.default.url
        channelImg.style.background=`url(${channeLogoPicURL}) no-repeat center center/cover`


        titleContainer.append(channelImg)
        titleContainer.append(channelTitle)
        

        videoContainer.append(thumbnailContainer);
        videoContainer.append(titleContainer);
        mainContent.append(videoContainer);

      








    });
}












// // BASE_URL/Search?API_KEY
async function fetchVideos(searchQuery,maxResults){
    try{
        const response=await fetch(
            BASE_URL+
            "/search"+
            `?key=${API_KEY}`+
            `&part=snippet`+
            `&q=${searchQuery}`+
            `&maxResults=${maxResults}`
        );
        const data=await response.json();
        return data;
    }catch(e){
        console.log(e);
    }
}

async function fetchChannelLogo(channelId){
    try{
        const response=await fetch(
            BASE_URL+
            "/channels"+
            `?key=${API_KEY}`+
           " &part=snippet"+
            `&id=${channelId}`
        )
        const data= await response.json()
        return data;
    }
    catch(e){
        console.log(e)
    }
}




// // BASE_URL/videos=>views/duration
// // typeOfDetails=> "contentDetails"=>duration
// // typeOfDetails=> "statistics"=>viewCount

// async function fetchVideoStats(videoId,typeOfDetails){
//     try{
//         const response=await fetch(
//             BASE_URL+
//             "/videos"+
//             `?key=${API_KEY}`+
//             `&part=${typeOfDetails}`+
//             `&id=${videoId}`
//         )
//         const data= await response.json()
//         console.log(data)
//     }
//     catch(e){
//         console.log(e)
//     }
// }






// async function getComments(videoId){
//     try{
//         const response=await fetch(
//             BASE_URL+
//             "/commentThreads"+
//             `?key=${API_KEY}`+
//             `&videoId=${videoId}`+
//             `&maxResults=25&part=snippet`
//         )
//         const data= await response.json()
//         console.log(data)
//     }
//     catch(e){
//         console.log(e)
//     }
// }




