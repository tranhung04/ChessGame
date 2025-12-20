import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Text
} from 'react-native';
import ChessPiece from './ChessPiece';
import { COLORS } from '../../../config/constants';
import { BOARD_CONFIG } from '../../../game/constants';

const { width } = Dimensions.get('window');
const BOARD_SIZE = width - 40;
const CELL_SIZE = BOARD_SIZE / BOARD_CONFIG.COLS;

export default function ChessBoard({
  board,
  onCellPress,
  validMoves = [],
  dangerMoves = [],
  trapMoves = [],
  safeMoves = [],
  selectedCell = null,
  gameMode,
  getPieceSymbol,
  getCaptureValue,
  fireBlastCells = [],
  fireBlastAnim,
  capturingCell = null,
  captureAnim
}) {
  const renderCell = (row, col) => {
    const piece = board[row][col];
    const isLight = (row + col) % 2 === 0;
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;

    // Check if this cell is a valid move
    const isSafeMove = safeMoves.some(m => m.row === row && m.col === col);
    const isDangerMove = dangerMoves.some(m => m.row === row && m.col === col);
    const isTrapMove = trapMoves.some(m => m.row === row && m.col === col);

    // Check if this cell is part of fire blast animation
    const isFireBlastCell = fireBlastCells.some(c => c.row === row && c.col === col);

    // Check if this cell is being captured
    const isCapturingCell = capturingCell?.row === row && capturingCell?.col === col;

    // Setup mode: highlight empty cells or cells with player Xe for placement
    const isSetupMode = gameMode === 'setup';
    const isPlaceable = isSetupMode && (!piece || (piece && piece.type === 'xe' && !piece.isEnemy));

    // Get capture value for tooltip
    const captureValue = getCaptureValue ? getCaptureValue(row, col) : 0;

    // Calculate fire blast animation styles
    const fireBlastScale = fireBlastAnim ? fireBlastAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1.3, 0.8]
    }) : 1;

    const fireBlastOpacity = fireBlastAnim ? fireBlastAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.7, 0]
    }) : 1;

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.cell,
          { width: CELL_SIZE, height: CELL_SIZE },
          isLight ? styles.cellLight : styles.cellDark,
          isSelected && styles.cellSelected,
          isSafeMove && styles.cellSafe,
          isDangerMove && styles.cellDanger,
          isTrapMove && styles.cellTrap,
          isPlaceable && styles.cellPlaceable
        ]}
        onPress={() => onCellPress(row, col)}
      >
        {piece && !isFireBlastCell && !isCapturingCell && (
          <ChessPiece
            type={piece.type}
            isEnemy={piece.isEnemy}
            size={CELL_SIZE}
            symbol={getPieceSymbol ? getPieceSymbol(piece.type) : '?'}
          />
        )}
        {piece && isCapturingCell && captureAnim && (
          <Animated.View style={{ opacity: captureAnim }}>
            <ChessPiece
              type={piece.type}
              isEnemy={piece.isEnemy}
              size={CELL_SIZE}
              symbol={getPieceSymbol ? getPieceSymbol(piece.type) : '?'}
            />
          </Animated.View>
        )}
        {captureValue > 0 && (isSafeMove || isDangerMove || isTrapMove) && (
          <Text style={styles.captureValue}>+{captureValue}</Text>
        )}
        {isFireBlastCell && fireBlastAnim && (
          <Animated.View
            style={[
              styles.fireBlastEffect,
              {
                transform: [{ scale: fireBlastScale }],
                opacity: fireBlastOpacity
              }
            ]}
          >
            <Text style={styles.fireBlastEmoji}>🔥</Text>
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.boardContainer}>
      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  board: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.boardLight
  },
  row: {
    flexDirection: 'row'
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#ccc'
  },
  cellLight: {
    backgroundColor: COLORS.boardLight
  },
  cellDark: {
    backgroundColor: COLORS.boardDark
  },
  cellSelected: {
    backgroundColor: '#FFD70040',
    borderWidth: 3,
    borderColor: '#FFD700'
  },
  cellSafe: {
    backgroundColor: '#00FF0040',
    borderWidth: 2,
    borderColor: '#00FF00'
  },
  cellDanger: {
    backgroundColor: '#FF000040',
    borderWidth: 2,
    borderColor: '#FF0000'
  },
  cellTrap: {
    backgroundColor: '#FFA50040',
    borderWidth: 2,
    borderColor: '#FFA500'
  },
  cellPlaceable: {
    backgroundColor: '#4169E120',
    borderWidth: 1,
    borderColor: '#4169E1',
    borderStyle: 'dashed'
  },
  captureValue: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFD700',
    backgroundColor: '#00000080',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3
  },
  fireBlastEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF4500CC',
    borderRadius: 4
  },
  fireBlastEmoji: {
    fontSize: 32,
    textAlign: 'center',
    textShadowColor: '#FF0000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10
  }
});
