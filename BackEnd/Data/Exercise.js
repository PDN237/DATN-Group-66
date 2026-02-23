class Exercise {
    constructor(exerciseID, lessonID, title, description, difficulty, expectedOutput) {
        this.ExerciseID = exerciseID;
        this.LessonID = lessonID;
        this.Title = title;
        this.Description = description;
        this.Difficulty = difficulty;
        this.ExpectedOutput = expectedOutput;
    }
}

module.exports = Exercise;
