import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../config/constants';

export default function GameControls({
  gameMode,
  onStartGame,
  onEndGame,
  onPlayAgain,
  playerXePlaced = false,
  selectedCell = null,
  turnCount = 0,
  currentTurn = 'player'
}) {
  return (
    <View style={styles.controls}>
      {/* Setup Phase */}
      {gameMode === 'setup' && (
        <>
          <Text style={styles.notice}>
            📍 Đặt quân Xe của bạn
          </Text>
          <Text style={styles.noticeText}>
            Nhấn vào ô bất kỳ để đặt quân Xe
          </Text>
          
          <TouchableOpacity 
            style={[styles.button, !playerXePlaced && styles.buttonDisabled]} 
            onPress={onStartGame}
            disabled={!playerXePlaced}
          >
            <Ionicons name="play" size={24} color={COLORS.white} />
            <Text style={styles.buttonText}>Bắt Đầu Game</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Playing Phase */}
      {gameMode === 'playing' && (
        <>
          {currentTurn === 'player' && selectedCell && (
            <View style={styles.legend}>
              <Text style={styles.legendTitle}>Chú thích:</Text>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#00FF0030' }]} />
                <Text style={styles.legendText}>An toàn</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FF000030' }]} />
                <Text style={styles.legendText}>Nguy hiểm</Text>
              </View>
              {turnCount < 10 && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#FFA50030' }]} />
                  <Text style={styles.legendText}>Bẫy</Text>
                </View>
              )}
            </View>
          )}
        </>
      )}
      
      {/* Play Again Button (always available) */}
      <TouchableOpacity style={styles.button} onPress={onPlayAgain}>
        <Ionicons name="refresh" size={24} color={COLORS.white} />
        <Text style={styles.buttonText}>Chơi Lại</Text>
      </TouchableOpacity>

      {/* End Game Button (only during playing phase) */}
      {gameMode === 'playing' && (
        <TouchableOpacity
          style={[styles.button, styles.buttonDanger]}
          onPress={onEndGame}
        >
          <Ionicons name="stop" size={24} color={COLORS.white} />
          <Text style={styles.buttonText}>Kết Thúc</Text>
        </TouchableOpacity>
      )}

      {/* Ended Phase */}
      {gameMode === 'ended' && (
        <>
          <Text style={styles.notice}>
            🏁 Game đã kết thúc
          </Text>
          <Text style={styles.noticeText}>
            Nhấn "Chơi Lại" để bắt đầu game mới
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    flex: 1,
    justifyContent: 'center'
  },
  notice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.warning,
    textAlign: 'center',
    marginBottom: 10
  },
  noticeText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20
  },
  button: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  buttonDanger: {
    backgroundColor: COLORS.error
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6
  },
  legend: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textLight
  }
});
