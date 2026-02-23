class Review {
    constructor(reviewID, userID, courseID, rating, comment, createdAt) {
        this.ReviewID = reviewID;
        this.UserID = userID;
        this.CourseID = courseID;
        this.Rating = rating;
        this.Comment = comment;
        this.CreatedAt = createdAt;
    }
}

module.exports = Review;
