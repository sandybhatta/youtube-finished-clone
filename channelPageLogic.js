const API_KEY = "AIzaSyBvsf6Dfcl-mkts80OXqNXtleRRA63-GxA";
const BASE_URL = "https://www.googleapis.com/youtube/v3";

const mainPage=document.getElementById('main-content')
const banner=document.querySelector('.banner-image')
const headerAbout=document.querySelector('.header-about')
const channelLogoPic=document.querySelector('.channel-pic')
const channelName=document.querySelector('.channel-name')
const subscriberCount=document.querySelector('.subscribers-count')
const videoCount=document.querySelector('.video-count')
const itemShowingpage=document.querySelector('.show-items')

const videoThumbnail=document.querySelector('.video-thumbnail')
const videoName=document.querySelector('.video-name')
const views=document.querySelector('.views')
const daysAgo=document.querySelector('.days-ago')
const videoDescription=document.querySelector('.video-description')
const firstVideo=document.querySelector('.first-video')

const otherVideos=document.querySelector('.other-videos')


window.addEventListener('load', () => {
    loadChannelPage();
});

async function loadChannelPage() {
    let channelId = localStorage.getItem("selectedChannelId");
    
    // Fetch channel details
    const channelData = await fetchChannelDetails(channelId);
    if (channelData && channelData.items && channelData.items.length > 0) {
        const channelInfo = channelData.items[0];
        channelAbout(channelInfo);
    }

    // Fetch channel videos
    const videosData = await fetchChannelVideos(channelId);
    
        videoRendering(videosData.items);
        
}

async function videoRendering(videoList) {
    videoList.forEach(async (video, index) => {

       




        let videoThumbnailLogoPicUrl = video.snippet.thumbnails.high.url;
        const videoStats = await fetchVideoStats(video.id.videoId)
        if (index == 0) {
            videoThumbnail.style.background = `url(${videoThumbnailLogoPicUrl}) no-repeat center center/cover`;
            videoName.innerText = video.snippet.title;

            
            
                views.innerText = videoStats.items[0].statistics.viewCount + " views";
                daysAgo.innerText = ago(video.snippet.publishedAt);
                videoDescription.innerText = video.snippet.description;
                firstVideo.addEventListener("click",()=>{
                    // localStorage.clear()
                    const videoData = {0: "channel", 1: video.id.videoId};
    localStorage.setItem("selectedVideoId", JSON.stringify(videoData));
                    window.location.href="videoDetails.html"
                })
        
            
        }
        else if(videoStats.items.length!==0){
            
              const otherVideoHolder=document.createElement('div')
              otherVideoHolder.className="video-holder"

              const videoThumbpic=document.createElement('div')
              videoThumbpic.className='video-thumbpic'

              const videoTitleStats=document.createElement('div')
              videoTitleStats.className='video-title-stats'

              const h2=document.createElement('h2')
              const h4=document.createElement('h4')
              const spanView=document.createElement('span')
              const spanDaysAgo=document.createElement('span')

            let videoThumbLogo=video.snippet.thumbnails.high.url

            videoThumbpic.style.background=`url(${videoThumbLogo}) no-repeat center center/cover`

            h2.innerText=video.snippet.title
            h4.innerText=video.snippet.channelTitle
            let viewsCount=formatNumber(videoStats.items[0].statistics.viewCount) + " views"

            spanView.innerText=viewsCount
            spanDaysAgo.innerText=ago(video.snippet.publishedAt)

            
            

              videoTitleStats.append(h2)
              videoTitleStats.append(h4)
              videoTitleStats.append(spanView)
              videoTitleStats.append(spanDaysAgo)
              otherVideoHolder.append(videoThumbpic)
              otherVideoHolder.append(videoTitleStats)
              otherVideos.append(otherVideoHolder)
              otherVideoHolder.addEventListener("click",()=>{
                // localStorage.clear()
                const videoData = {0: "channel", 1: video.id.videoId};
    localStorage.setItem("selectedVideoId", JSON.stringify(videoData))
                window.location.href="videoDetails.html"
            })
        }

    });
}

function ago(publishedDate) {
    let currDate = new Date();
    let published = new Date(publishedDate);

    let diffInTime = currDate - published;
    let diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24));

    if (diffInDays < 7) {
        return diffInDays + " days ago";
    }

    let diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return diffInWeeks + " weeks ago";
    }

    let diffInMonths = (currDate.getFullYear() - published.getFullYear()) * 12 + (currDate.getMonth() - published.getMonth());
    if (diffInMonths < 12) {
        return diffInMonths + " months ago";
    }

    let diffInYears = Math.floor(diffInMonths / 12);
    return diffInYears + " years ago";
}

function channelAbout(channelInfo) {
    let bannerImageUrl = channelInfo.brandingSettings.image.bannerExternalUrl;
    const img = document.createElement('img');
    img.className = "banner-image-pic";
    img.src = bannerImageUrl;
    banner.append(img);

    let channelLogoPicUrl = channelInfo.snippet.thumbnails.default.url;
    channelLogoPic.style.background = `url(${channelLogoPicUrl}) no-repeat center center/cover`;
    channelName.innerText = channelInfo.snippet.title;
    let subscriber = formatNumber(channelInfo.statistics.subscriberCount);
    subscriberCount.innerText = subscriber + " subscribers";
    videoCount.innerText = channelInfo.statistics.videoCount + " videos";
}

function formatNumber(number) {
    if (number >= 1000000000) {
        return roundToTwoDecimals(number / 1000000000) + 'B';
    } else if (number >= 1000000) {
        return roundToTwoDecimals(number / 1000000) + 'M';
    } else if (number >= 1000) {
        return roundToTwoDecimals(number / 1000) + 'K';
    } else {
        return number.toString();
    }
}

function roundToTwoDecimals(num) {
    return Math.round(num * 100) / 100;
}

async function fetchChannelDetails(channelId) {
    try {
        const response = await fetch(
            `${BASE_URL}/channels?key=${API_KEY}&part=snippet,statistics,brandingSettings&id=${channelId}`
        );
        const data = await response.json();
        return data;
    } catch (e) {
        console.error(e);
    }
}

async function fetchChannelVideos(channelId, maxResults = 25) {
    try {
        const response = await fetch(
            `${BASE_URL}/search?key=${API_KEY}&part=snippet&channelId=${channelId}&maxResults=${maxResults}`
        );
        const data = await response.json();
        return data;
    } catch (e) {
        console.error(e);
    }
}

async function fetchVideoStats(videoId) {
    try {
        const response = await fetch(
            `${BASE_URL}/videos?key=${API_KEY}&part=contentDetails,statistics&id=${videoId}`
        );
        const data = await response.json();
        return data;
    } catch (e) {
        console.error(e);
    }
}