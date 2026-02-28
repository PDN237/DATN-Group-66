const { poolPromise } = require('../db');

const getAllProblems = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.query(`
      SELECT 
         id,
        title,
        description,
        difficulty,
        time_limit,
        memory_limit,
        hints,
        examples
      FROM Problems
      ORDER BY id
    `);
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu problems',
      error: error.message
    });
  }
};

const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const result = await pool.query(`
      SELECT 
        id,
        title,
        description,
        difficulty,
        time_limit,
        memory_limit,
        hints,
        examples
      FROM Problems
      WHERE id = ${id}
    `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy problem'
      });
    }
    
    res.json({
      success: true,
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu problem',
      error: error.message
    });
  }
};

const getTestCasesByProblemId = async (req, res) => {
  try {
    const { problemId } = req.params;
    const pool = await poolPromise;
    
    const result = await pool.query(`
      SELECT 
        id,
        problem_id,
        input_data,
        expected_output,
        is_hidden
      FROM TestCases
      WHERE problem_id = ${problemId}
      ORDER BY id
    `);
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching test cases:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu test cases',
      error: error.message
    });
  }
};

module.exports = {
  getAllProblems,
  getProblemById,
  getTestCasesByProblemId
};
