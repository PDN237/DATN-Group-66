const { poolPromise, sql } = require('../db');
const judgeService = require('../services/judge.service');

/**
 * Normalize output for comparison
 * - Trim whitespace
 * - Replace multiple spaces with single space
 * - Normalize newlines
 */
function normalizeOutput(output) {
    if (!output) return '';
    return output
        .trim()
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/ +/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();
}

/**
 * Compare two outputs
 */
function compareOutput(actual, expected) {
    const normalizedActual = normalizeOutput(actual);
    const normalizedExpected = normalizeOutput(expected);
    
    return normalizedActual === normalizedExpected;
}

/**
 * Run single test case (for progressive display)
 */
const runSingleTestCase = async (problemId, code, inputData, expectedOutput) => {
    const pool = await poolPromise;
    
    // Submit to Judge0
    const judgeResult = await judgeService.submitAndWait(
        code,
        'python3', // Default language is Python3
        inputData
    );

    let testStatus = 'Wrong Answer';
    let output = '';
    let executionTime = 0;
    let memoryUsed = 0;

    if (judgeResult.success) {
        output = (judgeResult.stdout || '').trim();
        executionTime = judgeResult.time || 0;
        memoryUsed = judgeResult.memory || 0;

        // Check status
        const statusId = judgeResult.status.id;
        
        if (statusId === 3) {
            // Accepted - compare output with normalization
            if (compareOutput(output, expectedOutput)) {
                testStatus = 'Accepted';
            } else {
                testStatus = 'Wrong Answer';
            }
        } else if (statusId === 4) {
            testStatus = 'Wrong Answer';
        } else if (statusId === 5) {
            testStatus = 'Time Limit Exceeded';
        } else if (statusId === 6) {
            testStatus = 'Runtime Error';
        } else if (statusId === 7) {
            testStatus = 'Runtime Error';
        } else if (statusId === 11) {
            testStatus = 'Memory Limit Exceeded';
        } else if (statusId === 12) {
            testStatus = 'System Error';
        } else if (statusId === 13) {
            testStatus = 'Accepted'; // Internal Judge0 accepted
        }

        // Check for compile error
        if (judgeResult.compile_output) {
            testStatus = 'Compilation Error';
            output = judgeResult.compile_output;
        }
    } else {
        testStatus = 'System Error';
        output = judgeResult.error || 'Unknown error';
    }

    return {
        status: testStatus,
        output: output,
        runtime: executionTime,
        memory: memoryUsed
    };
};

/**
 * Submit code for a problem
 * POST /api/submit/:problemId
 * Body: { code: "user source code" }
 * OR for single test case: { code, testCaseId, inputData, expectedOutput }
 */
const submitCode = async (req, res) => {
    const { problemId } = req.params;
    const { code, testCaseId, inputData, expectedOutput } = req.body;

    // Validate input
    if (!code || !code.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Code is required'
        });
    }

    if (!problemId) {
        return res.status(400).json({
            success: false,
            message: 'Problem ID is required'
        });
    }

    // Check if this is a single test case run (for progressive display)
    if (testCaseId !== undefined && inputData !== undefined && expectedOutput !== undefined) {
        try {
            const result = await runSingleTestCase(problemId, code, inputData, expectedOutput);
            
            return res.json({
                success: true,
                data: {
                    testCaseId: testCaseId,
                    status: result.status,
                    output: result.output,
                    runtime: result.runtime,
                    memory: result.memory
                }
            });
        } catch (error) {
            console.error('Error running single test case:', error);
            return res.status(500).json({
                success: false,
                message: 'Error running test case',
                error: error.message
            });
        }
    }

    // Full submission - run all test cases
    const connection = await poolPromise;
    const transaction = new sql.Transaction(connection);
    
    try {
        await transaction.begin();
        
        // 1. Get problem details
        const problemResult = await connection.query`
            SELECT id, title, time_limit, memory_limit 
            FROM Problems 
            WHERE id = ${problemId}
        `;

        if (problemResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        // 2. Get all test cases for the problem
        const testCasesResult = await connection.query`
            SELECT id, input_data, expected_output, is_hidden 
            FROM TestCases 
            WHERE problem_id = ${problemId}
            ORDER BY id
        `;

        const testCases = testCasesResult.recordset;

        if (testCases.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No test cases found for this problem'
            });
        }

        // 3. Insert initial submission record
        const insertSubmissionRequest = new sql.Request(transaction);
        const submissionResult = await insertSubmissionRequest
            .input('problem_id', sql.Int, problemId)
            .input('code', sql.NText, code)
            .input('status', sql.NVarChar(50), 'Pending')
            .input('execution_time', sql.Float, 0)
            .input('memory_used', sql.Float, 0)
            .query(`
                INSERT INTO Submissions (problem_id, code, status, execution_time, memory_used)
                VALUES (@problem_id, @code, @status, @execution_time, @memory_used);
                SELECT SCOPE_IDENTITY() AS id;
            `);

        const submissionId = submissionResult.recordset[0].id;

        // Array to store test results
        const testResults = [];
        let finalStatus = 'Accepted';
        let totalExecutionTime = 0;
        let totalMemoryUsed = 0;

        // 4. Loop through test cases
        for (const testCase of testCases) {
            const input = testCase.input_data || '';
            const expected = (testCase.expected_output || '').trim();
            
            // Submit to Judge0
            const judgeResult = await judgeService.submitAndWait(
                code,
                'python3', // Default language is Python3
                input
            );

            let testStatus = 'Wrong Answer';
            let output = '';
            let executionTime = 0;
            let memoryUsed = 0;

            if (judgeResult.success) {
                output = (judgeResult.stdout || '').trim();
                executionTime = judgeResult.time || 0;
                memoryUsed = judgeResult.memory || 0;

                // Check status
                const statusId = judgeResult.status.id;
                
                if (statusId === 3) {
                    // Accepted - compare output with normalization
                    if (compareOutput(output, expected)) {
                        testStatus = 'Accepted';
                    } else {
                        testStatus = 'Wrong Answer';
                    }
                } else if (statusId === 4) {
                    testStatus = 'Wrong Answer';
                } else if (statusId === 5) {
                    testStatus = 'Time Limit Exceeded';
                } else if (statusId === 6) {
                    testStatus = 'Runtime Error';
                } else if (statusId === 7) {
                    testStatus = 'Runtime Error';
                } else if (statusId === 11) {
                    testStatus = 'Memory Limit Exceeded';
                } else if (statusId === 12) {
                    testStatus = 'System Error';
                } else if (statusId === 13) {
                    testStatus = 'Accepted'; // Internal Judge0 accepted
                }

                // Check for compile error
                if (judgeResult.compile_output) {
                    testStatus = 'Compilation Error';
                    output = judgeResult.compile_output;
                }
            } else {
                testStatus = 'System Error';
                output = judgeResult.error || 'Unknown error';
            }

            // Insert result for this test case
            const insertResultRequest = new sql.Request(transaction);
            await insertResultRequest
                .input('submission_id', sql.Int, submissionId)
                .input('testcase_id', sql.Int, testCase.id)
                .input('status', sql.NVarChar(50), testStatus)
                .input('output', sql.NText, output)
                .input('execution_time', sql.Float, executionTime)
                .query(`
                    INSERT INTO Results (submission_id, testcase_id, status, output, execution_time)
                    VALUES (@submission_id, @testcase_id, @status, @output, @execution_time)
                `);

            // Add to test results
            testResults.push({
                id: testCase.id,
                status: testStatus,
                input: testCase.is_hidden ? '[Hidden]' : input,
                expectedOutput: testCase.is_hidden ? '[Hidden]' : expected,
                actualOutput: testCase.is_hidden ? '[Hidden]' : output,
                executionTime: executionTime,
                memory: memoryUsed
            });

            // Update totals
            totalExecutionTime += executionTime;
            totalMemoryUsed = Math.max(totalMemoryUsed, memoryUsed);

            // 5. Update final status if not accepted (but continue checking all test cases)
            if (testStatus !== 'Accepted' && finalStatus === 'Accepted') {
                finalStatus = testStatus;
            }
        }

        // 6. Update submission status
        const updateSubmissionRequest = new sql.Request(transaction);
        await updateSubmissionRequest
            .input('id', sql.Int, submissionId)
            .input('status', sql.NVarChar(50), finalStatus)
            .input('execution_time', sql.Float, totalExecutionTime)
            .input('memory_used', sql.Float, totalMemoryUsed)
            .query(`
                UPDATE Submissions 
                SET status = @status, 
                    execution_time = @execution_time, 
                    memory_used = @memory_used
                WHERE id = @id
            `);

        await transaction.commit();

        // 7. Return response
        res.json({
            success: true,
            data: {
                submissionId: submissionId,
                status: finalStatus,
                runtime: totalExecutionTime,
                memory: totalMemoryUsed,
                testcases: testResults.map(tc => ({
                    id: tc.id,
                    status: tc.status
                }))
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error submitting code:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting code',
            error: error.message
        });
    }
};

/**
 * Get submission details
 * GET /api/submissions/:submissionId
 */
const getSubmissionById = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const pool = await poolPromise;

        // Get submission
        const submissionResult = await pool.query(`
            SELECT 
                s.id, s.problem_id, s.code, s.status, 
                s.execution_time, s.memory_used, s.created_at,
                p.title as problem_title
            FROM Submissions s
            JOIN Problems p ON s.problem_id = p.id
            WHERE s.id = ${submissionId}
        `);

        if (submissionResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Get results
        const resultsResult = await pool.query(`
            SELECT 
                r.id, r.testcase_id, r.status, r.output, r.execution_time,
                t.input_data, t.expected_output, t.is_hidden
            FROM Results r
            JOIN TestCases t ON r.testcase_id = t.id
            WHERE r.submission_id = ${submissionId}
            ORDER BY t.id
        `);

        res.json({
            success: true,
            data: {
                ...submissionResult.recordset[0],
                results: resultsResult.recordset
            }
        });

    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching submission',
            error: error.message
        });
    }
};

module.exports = {
    submitCode,
    getSubmissionById
};
