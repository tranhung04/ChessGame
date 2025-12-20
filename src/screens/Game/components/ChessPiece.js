import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../config/constants';

// Memoized ChessPiece component to prevent unnecessary re-renders
// Only re-renders when props actually change
// Requirements: 1.1, 1.2
const ChessPiece = React.memo(({ type, isEnemy, size, symbol }) => {
  return (
    <Text
      style={[
        styles.pieceText,
        { fontSize: size * 0.5 },
        isEnemy ? styles.enemyPiece : styles.playerPiece
      ]}
    >
      {symbol}
    </Text>
  );
});

ChessPiece.displayName = 'ChessPiece';

export default ChessPiece;

const styles = StyleSheet.create({
  pieceText: {
    fontWeight: 'bold'
  },
  playerPiece: {
    color: COLORS.player
  },
  enemyPiece: {
    color: COLORS.enemy
  }
});
