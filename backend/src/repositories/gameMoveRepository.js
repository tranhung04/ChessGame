const { getPool, sql } = require('../config/database');

/**
 * GameMove Repository
 * Handles database operations for game moves (optional - for anti-cheat)
 */

/**
 * Store a game move
 * @param {Object} moveData - Move data
 * @param {string} moveData.sessionId - Session ID
 * @param {number} moveData.moveNumber - Move number in sequence
 * @param {number} moveData.fromRow - Starting row (0-8)
 * @param {number} moveData.fromCol - Starting column (0-7)
 * @param {number} moveData.toRow - Ending row (0-8)
 * @param {number} moveData.toCol - Ending column (0-7)
 * @param {string} moveData.pieceType - Type of piece moved
 * @param {string} moveData.capturedPiece - Type of piece captured (optional)
 * @param {number} moveData.scoreGained - Score gained from this move
 * @returns {Promise<Object>} - Created move record
 */
async function storeMoveData(moveData) {
  try {
    const pool = await getPool();
    
    const query = `
      INSERT INTO GameMoves (
        SessionId, MoveNumber, FromRow, FromCol, ToRow, ToCol,
        PieceType, CapturedPiece, ScoreGained
      )
      OUTPUT INSERTED.Id, INSERTED.SessionId, INSERTED.MoveNumber,
             INSERTED.FromRow, INSERTED.FromCol, INSERTED.ToRow, INSERTED.ToCol,
             INSERTED.PieceType, INSERTED.CapturedPiece, INSERTED.ScoreGained,
             INSERTED.Timestamp
      VALUES (
        @sessionId, @moveNumber, @fromRow, @fromCol, @toRow, @toCol,
        @pieceType, @capturedPiece, @scoreGained
      )
    `;

    const result = await pool.request()
      .input('sessionId', sql.UniqueIdentifier, moveData.sessionId)
      .input('moveNumber', sql.Int, moveData.moveNumber)
      .input('fromRow', sql.Int, moveData.fromRow)
      .input('fromCol', sql.Int, moveData.fromCol)
      .input('toRow', sql.Int, moveData.toRow)
      .input('toCol', sql.Int, moveData.toCol)
      .input('pieceType', sql.NVarChar(20), moveData.pieceType)
      .input('capturedPiece', sql.NVarChar(20), moveData.capturedPiece || null)
      .input('scoreGained', sql.Int, moveData.scoreGained || 0)
      .query(query);

    return result.recordset[0];
  } catch (error) {
    console.error('Store move data error:', error.message);
    throw new Error('Failed to store move data');
  }
}

/**
 * Get moves by session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Array>} - Array of move records
 */
async function getMovesBySession(sessionId) {
  try {
    const pool = await getPool();
    
    const query = `
      SELECT Id, SessionId, MoveNumber, FromRow, FromCol, ToRow, ToCol,
             PieceType, CapturedPiece, ScoreGained, Timestamp
      FROM GameMoves
      WHERE SessionId = @sessionId
      ORDER BY MoveNumber ASC
    `;

    const result = await pool.request()
      .input('sessionId', sql.UniqueIdentifier, sessionId)
      .query(query);

    return result.recordset;
  } catch (error) {
    console.error('Get moves by session error:', error.message);
    throw new Error('Failed to retrieve moves');
  }
}

/**
 * Store multiple moves in batch
 * @param {Array} moves - Array of move data objects
 * @returns {Promise<number>} - Number of moves stored
 */
async function storeMovesBatch(moves) {
  try {
    const pool = await getPool();
    
    // Build bulk insert query
    const values = moves.map((_, index) => {
      return `(
        @sessionId${index}, @moveNumber${index}, @fromRow${index}, @fromCol${index},
        @toRow${index}, @toCol${index}, @pieceType${index}, @capturedPiece${index},
        @scoreGained${index}
      )`;
    }).join(',\n');

    const query = `
      INSERT INTO GameMoves (
        SessionId, MoveNumber, FromRow, FromCol, ToRow, ToCol,
        PieceType, CapturedPiece, ScoreGained
      )
      VALUES ${values}
    `;

    const request = pool.request();
    
    // Add parameters for each move
    moves.forEach((move, index) => {
      request
        .input(`sessionId${index}`, sql.UniqueIdentifier, move.sessionId)
        .input(`moveNumber${index}`, sql.Int, move.moveNumber)
        .input(`fromRow${index}`, sql.Int, move.fromRow)
        .input(`fromCol${index}`, sql.Int, move.fromCol)
        .input(`toRow${index}`, sql.Int, move.toRow)
        .input(`toCol${index}`, sql.Int, move.toCol)
        .input(`pieceType${index}`, sql.NVarChar(20), move.pieceType)
        .input(`capturedPiece${index}`, sql.NVarChar(20), move.capturedPiece || null)
        .input(`scoreGained${index}`, sql.Int, move.scoreGained || 0);
    });

    const result = await request.query(query);
    return result.rowsAffected[0];
  } catch (error) {
    console.error('Store moves batch error:', error.message);
    throw new Error('Failed to store moves batch');
  }
}

/**
 * Validate move sequence for anti-cheat
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} - Validation result
 */
async function validateMoveSequence(sessionId) {
  try {
    const pool = await getPool();
    
    const query = `
      SELECT 
        COUNT(*) as totalMoves,
        SUM(ScoreGained) as totalScore,
        MIN(MoveNumber) as firstMove,
        MAX(MoveNumber) as lastMove,
        DATEDIFF(second, MIN(Timestamp), MAX(Timestamp)) as durationSeconds
      FROM GameMoves
      WHERE SessionId = @sessionId
    `;

    const result = await pool.request()
      .input('sessionId', sql.UniqueIdentifier, sessionId)
      .query(query);

    const data = result.recordset[0];
    
    // Check for gaps in move sequence
    const gapQuery = `
      SELECT COUNT(*) as gaps
      FROM (
        SELECT MoveNumber, 
               LEAD(MoveNumber) OVER (ORDER BY MoveNumber) as NextMove
        FROM GameMoves
        WHERE SessionId = @sessionId
      ) as MoveSequence
      WHERE NextMove IS NOT NULL AND NextMove != MoveNumber + 1
    `;

    const gapResult = await pool.request()
      .input('sessionId', sql.UniqueIdentifier, sessionId)
      .query(gapQuery);

    const hasGaps = gapResult.recordset[0].gaps > 0;

    return {
      isValid: !hasGaps && data.totalMoves > 0,
      totalMoves: data.totalMoves,
      totalScore: data.totalScore,
      durationSeconds: data.durationSeconds,
      hasGaps,
      sequenceComplete: data.lastMove === data.totalMoves
    };
  } catch (error) {
    console.error('Validate move sequence error:', error.message);
    throw new Error('Failed to validate move sequence');
  }
}

/**
 * Delete moves for a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<number>} - Number of moves deleted
 */
async function deleteMovesForSession(sessionId) {
  try {
    const pool = await getPool();
    
    const query = `
      DELETE FROM GameMoves
      WHERE SessionId = @sessionId
    `;

    const result = await pool.request()
      .input('sessionId', sql.UniqueIdentifier, sessionId)
      .query(query);

    return result.rowsAffected[0];
  } catch (error) {
    console.error('Delete moves error:', error.message);
    throw new Error('Failed to delete moves');
  }
}

module.exports = {
  storeMoveData,
  getMovesBySession,
  storeMovesBatch,
  validateMoveSequence,
  deleteMovesForSession
};
