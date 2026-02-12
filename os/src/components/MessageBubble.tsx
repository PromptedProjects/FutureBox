import { View, Text, Image, StyleSheet } from 'react-native';
import type { Message } from '../types/models';
import { colors } from '../theme/tokens';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View
      style={[
        styles.bubble,
        {
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          backgroundColor: isUser ? colors.accent : colors.bgElevated,
          borderBottomRightRadius: isUser ? 4 : 16,
          borderBottomLeftRadius: isUser ? 16 : 4,
        },
      ]}
    >
      {message.images?.map((img, i) => (
        <Image
          key={i}
          source={{ uri: `data:image/jpeg;base64,${img}` }}
          style={styles.image}
          resizeMode="cover"
        />
      ))}
      {message.content ? (
        <Text selectable style={[styles.content, { color: isUser ? 'white' : colors.text }]}>
          {message.content}
        </Text>
      ) : null}
      {message.model && (
        <Text
          style={[
            styles.model,
            { color: isUser ? 'rgba(255,255,255,0.6)' : colors.textMuted },
          ]}
        >
          {message.model}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '85%',
    marginVertical: 3,
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 10,
    marginBottom: 6,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
  },
  model: {
    fontSize: 11,
    marginTop: 4,
  },
});
