class Video {
    constructor(videoID, lessonID, title, videoURL, duration) {
        this.VideoID = videoID;
        this.LessonID = lessonID;
        this.Title = title;
        this.VideoURL = videoURL;
        this.Duration = duration;
    }
}

module.exports = Video;
