import { TouchableOpacity, Image, Text, View, StyleSheet, ImageBackground } from 'react-native';

export default function TripCard({
  title,
  duration,
  places,
  distance,
  imageUrl,
  onPress,
  fullWidth = false,
  width,
  imageHeight,
  role,
}) {
  const cardWidth = fullWidth ? '100%' : width ?? 200;
  const resolvedImageHeight = imageHeight ?? (fullWidth ? 160 : 100);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        fullWidth && styles.cardFull,
        { width: cardWidth, height: resolvedImageHeight },
      ]}
      onPress={onPress}
    >
      {imageUrl ? (
        <ImageBackground
          source={{ uri: imageUrl }}
          style={[styles.image, { height: resolvedImageHeight }]}
          resizeMode="cover"
          imageStyle={{ borderRadius: 10 }}
        >
          {role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{role}</Text>
            </View>
          )}
          <View style={styles.overlay}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.cardText}>{duration}</Text>
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.image, { height: resolvedImageHeight, backgroundColor: '#ccc' }]}>
          {role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{role}</Text>
            </View>
          )}
          <View style={styles.overlay}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.cardText}>{duration}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#b1b1b1',
    marginRight: 15,
    borderRadius: 10,
  },
  cardFull: {
    marginRight: 0,
  },
  image: {
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardText: {
    color: '#eee',
    fontSize: 14,
  },
  roleBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});
