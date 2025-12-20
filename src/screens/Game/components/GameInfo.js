import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../config/constants';

export default function GameInfo({
  turnCount,
  score,
  gamePhase,
  currentTurn,
  fireModeActive
}) {
  const getGamePhaseText = () => {
    switch (gamePhase) {
      case 'setup':
        return 'Setup';
      case 'playing':
        return 'Chơi';
      case 'ended':
        return 'Kết thúc';
      default:
        return gamePhase;
    }
  };

  const getCurrentTurnText = () => {
    return currentTurn === 'player' ? 'Người chơi' : 'Máy';
  };

  return (
    <View>
      {/* Info Panel */}
      <View style={styles.infoPanel}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Điểm:</Text>
          <Text style={styles.infoValue}>{score}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Lượt:</Text>
          <Text style={styles.infoValue}>{turnCount}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Pha:</Text>
          <Text style={styles.infoValue}>{getGamePhaseText()}</Text>
        </View>
      </View>

      {/* Fire Mode Indicator */}
      {fireModeActive && (
        <View style={styles.fireModeIndicator}>
          <Text style={styles.fireModeText}>🔥 FIRE MODE ACTIVE 🔥</Text>
          <Text style={styles.fireModeSubtext}>Next move will trigger fire blast!</Text>
        </View>
      )}

      {/* Current Turn Display (during playing phase) */}
      {gamePhase === 'playing' && (
        <View style={styles.turnIndicator}>
          <Text style={styles.turnText}>
            🎮 Lượt: {getCurrentTurnText()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  infoPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  infoItem: {
    alignItems: 'center'
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight
  },
  infoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  fireModeIndicator: {
    backgroundColor: '#FF4500',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8
  },
  fireModeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center'
  },
  fireModeSubtext: {
    fontSize: 12,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 5
  },
  turnIndicator: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center'
  },
  turnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text
  }
});
