const otherRelatedVideos = document.querySelector('.other-related-videos');
const videoName = document.querySelector('.video-name');
const viewCount = document.querySelector('.view-count');
const days = document.querySelector('.days');
const like = document.querySelector('.like');
const channelImage = document.querySelector('.channel-image');
const channelName = document.querySelector('.channel-name');
const subscriberCount = document.querySelector('.subscriber-count');
const channelDescription = document.querySelector('.channel-description');
const publicCommentSection = document.querySelector('.public-comment-section');

const API_KEY = "AIzaSyBvsf6Dfcl-mkts80OXqNXtleRRA63-GxA"; // Replace with your YouTube Data API Key
const BASE_URL = "https://www.googleapis.com/youtube/v3";
let myselectedVideoObj = JSON.parse(localStorage.getItem("selectedVideoId"));
let sourceOfClick = myselectedVideoObj[0];
let videoId = myselectedVideoObj[1];

// Event Listener for Page Load
window.addEventListener("load", async () => {

    let myselectedVideoObj = JSON.parse(localStorage.getItem("selectedVideoId"));
    let sourceOfClick = myselectedVideoObj[0];
    let videoId = myselectedVideoObj[1];
    
    await videoPlayer(videoId);

    if (sourceOfClick === "popular") {
        await popularVideoRenderingUi();
    } else if (sourceOfClick === "result") {
        await relatedVideoRenderingUi();
    } else if (sourceOfClick === "channel") {
        await channelVideoRenderingUi();
    }
    
    await loadVideoDetails(videoId);
    await loadComments(videoId);
});

// Load the video using YouTube IFrame API
async function videoPlayer(videoId) {
    const playerDiv = document.getElementById('video-player');
    const player = document.createElement('iframe');
    player.width = '100%';
    player.height = '500px';
    player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1`;
    playerDiv.appendChild(player);
}

// Fetch and display video details (video name, views, likes, days ago, channel info)
async function loadVideoDetails(videoId) {
    const stats = await fetchVideoStats(videoId);
    const videoDetails = stats.items[0];

    videoName.innerText = videoDetails.snippet.title;
    viewCount.innerText = formatNumber(videoDetails.statistics.viewCount)+" views";
    days.innerText = ago(videoDetails.snippet.publishedAt);
    like.innerText = formatNumber(videoDetails.statistics.likeCount);

    const channelId = videoDetails.snippet.channelId;
    const channelDetails = await fetchChannelLogo(channelId);

    const channelInfo = channelDetails.items[0];
    channelImage.style.backgroundImage = `url(${channelInfo.snippet.thumbnails.default.url})`;
    channelName.innerText = channelInfo.snippet.title;
    subscriberCount.innerText = formatNumber(channelInfo.statistics.subscriberCount) + " subscribers";
    channelDescription.innerText = channelInfo.snippet.description;
}

// Popular Video Rendering
async function popularVideoRenderingUi() {
    let dataList = await fetchPopularVideos();
    renderVideos(dataList.items);
}

// Related Video Rendering based on search query
async function relatedVideoRenderingUi() {
    let userQuery = localStorage.getItem("userSearchedContent");
    let response = await fetchVideos(userQuery, 25);
    renderVideos(response.items);
}

// Channel Video Rendering
async function channelVideoRenderingUi() {
    let videoId = myselectedVideoObj[1];
    let channelId = await getChannelIdFromVideo(videoId);
    let response = await fetchChannelVideos(channelId);
    renderVideos(response.items);
}

// Function to render videos in the otherRelatedVideos container
function renderVideos(dataList) {
    otherRelatedVideos.innerHTML = ""; // Clear previous videos

    dataList.forEach(async (data) => {
        const videoContainer = document.createElement('div');
        videoContainer.className = "video-container";

        const videoThumbnail = document.createElement('div');
        videoThumbnail.className = "video-thumbnail";

        const titleContainer = document.createElement('div');
        titleContainer.className = "title-container";

        const videoDuration = formatDuration(data.contentDetails?.duration || '');
        const durationDiv = document.createElement('div');
        durationDiv.innerText = videoDuration;
        durationDiv.className = "duration-div";

        let viewCount = formatNumber(data.statistics?.viewCount || 0);
        let publishedAgo = ago(data.snippet.publishedAt);

        titleContainer.innerHTML = `
            <h3 class="video-name">${data.snippet.title}</h3>
            <div>
                <p class="channel-name">${data.snippet.channelTitle}</p>
                <span class="views">${viewCount}</span>
                <span class="years-ago">${publishedAgo}</span>
            </div>
        `;

        videoThumbnail.style.background = `url(${data.snippet.thumbnails.default.url}) no-repeat center center/cover`;
        videoThumbnail.append(durationDiv);
        videoContainer.append(videoThumbnail);
        videoContainer.append(titleContainer);
        otherRelatedVideos.append(videoContainer);

        videoContainer.addEventListener("click", () => {
            localStorage.setItem("selectedVideoId", JSON.stringify({ 0: "popular", 1: data.id.videoId }));
            window.location.href = "videoDetails.html";
        });
    });
}

// Load and render comments with replies
async function loadComments(videoId) {
    const comments = await getComments(videoId);
    await renderComments(comments);
}

// Render comments and replies
async function renderComments(comments) {
    publicCommentSection.innerHTML = ""; // Clear previous comments

    comments.items.forEach(comment => {
        const commentContainer = document.createElement('div');
        commentContainer.className = 'comment-container';  // Added class to comment container

        const commentAuthor = comment.snippet.topLevelComment.snippet.authorDisplayName.slice(1);
        const authorProfileImage = comment.snippet.topLevelComment.snippet.authorProfileImageUrl;
        const commentText = comment.snippet.topLevelComment.snippet.textDisplay;
        const commentLikeCount = comment.snippet.topLevelComment.snippet.likeCount;
        const replies = comment.replies ? comment.replies.comments : [];

        commentContainer.innerHTML = `
            <div class="comment-author">
                <img src="${authorProfileImage}" alt="${commentAuthor}">
                <span>${commentAuthor}</span>
            </div>
            <div class="comment-text">${commentText}</div>
            <div class="comment-likes">${commentLikeCount} likes</div>
            <p class="reply-button">REPLY</p>
        `;

        if (replies.length > 0) {
            const replyContainer = document.createElement('div');
            replyContainer.className = 'reply-container';
            replyContainer.style.display = 'none';

            replies.forEach(reply => {
                const replyAuthor = reply.snippet.authorDisplayName.slice(1);
                const replyProfileImage = reply.snippet.authorProfileImageUrl;
                const replyText = reply.snippet.textDisplay;

                const replyElement = document.createElement('div');
                replyElement.className = 'reply';
                replyElement.innerHTML = `
                    <div class="reply-author">
                        <img src="${replyProfileImage}" alt="${replyAuthor}">
                        <span>${replyAuthor}</span>
                    </div>
                    <div class="reply-text">${replyText}</div>
                `;

                replyContainer.appendChild(replyElement);
            });

            commentContainer.appendChild(replyContainer);

            const replyButton = commentContainer.querySelector('.reply-button');
            replyButton.addEventListener('click', () => {
                replyContainer.style.display = replyContainer.style.display === 'none' ? 'block' : 'none';
            });
        }

        publicCommentSection.appendChild(commentContainer);
    });
}
// Utility functions to fetch data from YouTube API
async function fetchVideoStats(videoId) {
    const response = await fetch(`${BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${API_KEY}`);
    const data=await response.json();
    console.log(data)
    return data
}

async function fetchChannelLogo(channelId) {
    const response = await fetch(`${BASE_URL}/channels?part=snippet,statistics&id=${channelId}&key=${API_KEY}`);
    return await response.json();
}

async function fetchPopularVideos() {
    const response = await fetch(`${BASE_URL}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=US&maxResults=25&key=${API_KEY}`);
    return await response.json();
}

async function fetchVideos(query, maxResults) {
    const response = await fetch(`${BASE_URL}/search?part=snippet,id&type=video&maxResults=${maxResults}&q=${query}&key=${API_KEY}`);
    return await response.json();
}

async function getChannelIdFromVideo(videoId) {
    const response = await fetchVideoStats(videoId);
    return response.items[0].snippet.channelId;
}

async function fetchChannelVideos(channelId) {
    const response = await fetch(`${BASE_URL}/search?part=snippet&channelId=${channelId}&maxResults=25&key=${API_KEY}`);
    return await response.json();
}

async function getComments(videoId) {
    const response = await fetch(`${BASE_URL}/commentThreads?part=snippet,replies&videoId=${videoId}&key=${API_KEY}`);
    return await response.json();
}

// Utility functions for formatting data

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

function ago(date) {
    const now = new Date();
    const past = new Date(date);
    const seconds = Math.floor((now - past) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1,
    };

    for (const [key, value] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / value);
        if (interval > 1) return `${interval} ${key}s ago`;
        if (interval === 1) return `${interval} ${key} ago`;
    }

    return "just now";
}

function formatDuration(duration) {
    let hours = 0, minutes = 0, seconds = 0;
    const hIndex = duration.indexOf('H');
    const mIndex = duration.indexOf('M');
    const sIndex = duration.indexOf('S');
    let time = "";

    if (hIndex !== -1) {
        const hoursPart = duration.slice(2, hIndex);
        hours = parseInt(hoursPart);
        time += hours + ":";
    }

    if (mIndex !== -1) {
        const start = hIndex !== -1 ? hIndex + 1 : 2;
        const minutesPart = duration.slice(start, mIndex);
        minutes = parseInt(minutesPart);
        time += minutes + ":";
    }

    if (sIndex !== -1) {
        const start = mIndex !== -1 ? mIndex + 1 : (hIndex !== -1 ? hIndex + 1 : 2);
        const secondsPart = duration.slice(start, sIndex);
        seconds = parseInt(secondsPart);
        time += seconds;
    }

    return time;
}