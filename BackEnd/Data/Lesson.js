class Lesson {
    constructor(lessonID, courseID, algorithmID, title, content, orderIndex) {
        this.LessonID = lessonID;
        this.CourseID = courseID;
        this.AlgorithmID = algorithmID;
        this.Title = title;
        this.Content = content;
        this.OrderIndex = orderIndex;
    }
}

module.exports = Lesson;
