CREATE TABLE Results (
    id INT PRIMARY KEY IDENTITY,
    submission_id INT,
    testcase_id INT,
    status NVARCHAR(50),
    output NTEXT,
    execution_time FLOAT,
    FOREIGN KEY (submission_id) REFERENCES Submissions(id),
    FOREIGN KEY (testcase_id) REFERENCES TestCases(id)
);

CREATE TABLE Submissions (
    id INT PRIMARY KEY IDENTITY,
    problem_id INT,
    code NTEXT,
    status NVARCHAR(50),
    execution_time FLOAT,
    memory_used FLOAT,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (problem_id) REFERENCES Problems(id)
);

CREATE TABLE TestCases (
    id INT PRIMARY KEY IDENTITY,
    problem_id INT,
    input_data NTEXT,
    expected_output NTEXT,
    is_hidden BIT DEFAULT 0,
    FOREIGN KEY (problem_id) REFERENCES Problems(id)
);

CREATE TABLE Problems (
    id INT PRIMARY KEY IDENTITY,
    title NVARCHAR(255),
    description NTEXT,
    difficulty NVARCHAR(20),
    time_limit INT DEFAULT 2,
    memory_limit INT DEFAULT 256
);