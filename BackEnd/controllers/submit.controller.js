const { poolPromise, sql } = require('../db');
const judgeService = require('../services/judge.service');

/**
 * Submit code for a problem
 * POST /api/submit/:problemId
 * Body: { 
 *   code: "user source code",
 *   language: "python" (optional, default: python)
 * }
 * OR for single test case: { code, testCaseId, inputData, expectedOutput, language }
 */
const submitCode = async (req, res) => {
    const { problemId } = req.params;
    const { code, testCaseId, inputData, expectedOutput, language = 'python' } = req.body;

    // Debug log
    console.log('=== DEBUG SUBMIT ===');
    console.log('problemId:', problemId);
    console.log('language:', language);
    console.log('code length:', code?.length);
    console.log('code preview:', code?.substring(0, 100));
    console.log('====================');

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
            // Fix: Unescape newlines from SQL Server
            const fixedInput = inputData.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
            const fixedExpected = expectedOutput.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
            
            const result = await judgeService.runSingleTestCase(
                code,
                fixedInput,
                fixedExpected,
                language
            );
            
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

        // 3. Insert initial submission record (without userId for now)
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
            // Fix: Unescape newlines from SQL Server
            let input = (testCase.input_data || '').replace(/\\n/g, '\n').replace(/\\r/g, '\r');
            const expected = (testCase.expected_output || '').replace(/\\n/g, '\n').replace(/\\r/g, '\r').trim();
            
            // Execute code with YepCode
            const judgeResult = await judgeService.runWithYepCode(
                code,
                input,
                language
            );

            let testStatus = 'Wrong Answer';
            let output = '';
            let executionTime = 0;
            let memoryUsed = 0;

            if (judgeResult.success) {
                output = (judgeResult.stdout || '').trim();
                executionTime = judgeResult.executionTime || 0;
                memoryUsed = judgeResult.memory || 0;

                // Check status from YepCode
                testStatus = judgeResult.status || 'Accepted';
                
                // If there's an error in stderr, it's a runtime error
                if (judgeResult.stderr && judgeResult.stderr.trim()) {
                    testStatus = 'Runtime Error';
                    output = judgeResult.stderr;
                }

                // Compare output with expected (only if no runtime error)
                if (testStatus === 'Accepted') {
                    console.log('=== DEBUG COMPARE ===');
                    console.log('Expected:', JSON.stringify(expected));
                    console.log('Actual output:', JSON.stringify(output));
                    console.log('Compare result:', judgeService.compareOutput(output, expected));
                    console.log('===================');
                    
                    if (!judgeService.compareOutput(output, expected)) {
                        testStatus = 'Wrong Answer';
                    }
                }
            } else {
                // Handle errors from YepCode
                testStatus = judgeResult.status || 'System Error';
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
            
            // If time limit exceeded or system error, we can stop early
            if (testStatus === 'Time Limit Exceeded' || testStatus === 'System Error') {
                // Mark remaining test cases as not executed
                for (let j = testCases.indexOf(testCase) + 1; j < testCases.length; j++) {
                    const remainingTC = testCases[j];
                    testResults.push({
                        id: remainingTC.id,
                        status: 'Not Executed',
                        input: remainingTC.is_hidden ? '[Hidden]' : remainingTC.input_data,
                        expectedOutput: remainingTC.is_hidden ? '[Hidden]' : remainingTC.expected_output,
                        actualOutput: '[Not Executed]',
                        executionTime: 0,
                        memory: 0
                    });
                }
                break;
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

