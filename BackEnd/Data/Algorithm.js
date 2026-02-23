class Algorithm {
    constructor(algorithmID, name, category, description, difficulty, createdAt) {
        this.AlgorithmID = algorithmID;
        this.Name = name;
        this.Category = category;
        this.Description = description;
        this.Difficulty = difficulty;
        this.CreatedAt = createdAt;
    }
}

module.exports = Algorithm;
