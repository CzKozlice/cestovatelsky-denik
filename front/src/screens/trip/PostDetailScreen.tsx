// React & React Native
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

// Navigace
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Utility & knihovny
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ikony & konfigurace
import { Feather } from '@expo/vector-icons';
import { API_URL, API_URL_IMAGE } from '@/constants/config';

// Kontexty & hooky
import { useProfile } from '@/context/ProfileContext';


const PostDetailScreen = () => {
  const route = useRoute();
  const [post, setPost] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const { profile } = useProfile();

  const navigation = useNavigation();

  const postId = route.params?.id;

  useEffect(() => {
    fetchPost();
  }, []);

  const fetchPost = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/auth/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPost(data);
      setUserRole(
        data.trip?.participants?.find((p: any) => p.user?.id === profile?.id)?.role ?? null
      );
      
    } catch (error) {
      console.error('Chyba při načítání příspěvku:', error);
    }
  };

  if (!post) return null;


  const handleDelete = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/auth/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        navigation.goBack();
      } else {
        const text = await res.text();
        try {
          const err = JSON.parse(text);
          alert(err.error || 'Chyba při mazání příspěvku.');
        } catch {
          alert('Chyba při mazání příspěvku.');
        }
      }
      
    } catch (error) {
      console.error('Chyba při mazání:', error);
      alert('Chyba při mazání příspěvku.');
    }
  };
  


  return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#5C55E1" />
          </TouchableOpacity>
          {(userRole === 'CREATOR' || userRole === 'COOWNER') && (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Feather name="trash-2" size={22} color="#5C55E1" />
            </TouchableOpacity>
          )}

          <View style={styles.authorRow}>
            <View style={styles.avatarBox}>
              {post.author?.avatarUrl ? (
                <Image
                  source={{ uri: `${API_URL_IMAGE}${post.author.avatarUrl}` }}
                  style={styles.avatar}
                />
              ) : (
                <Text style={styles.avatarEmoji}>👤</Text>
              )}
            </View>
            <Text style={styles.authorName}>{post.author?.username}</Text>
          </View>

          <Text style={styles.title}>{post.trip.name}</Text>
          <Text style={styles.date}>{moment(post.createdAt).format('D.M.YYYY HH:mm:ss')}</Text>

          <View style={styles.typeBox}>
            <Text style={styles.typeText}>
              {post.type === 'TEXT' ? 'Poznámka' : post.type === 'IMAGE' ? 'Obrázek' : 'Místo'}
            </Text>
          </View>

          {post.content && <Text style={styles.contentText}>{post.content}</Text>}

          {post.imageUrl && (
            <Image
              source={{ uri: `${API_URL_IMAGE}${post.imageUrl}` }}
              style={styles.image}
              resizeMode="cover"
            />
          )}

          {post.location && <Text style={styles.locationText}>📍 {post.location}</Text>}

        </ScrollView>
      </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  typeBox: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 20,
  },
  typeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  contentText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 12,
    gap: 10,
  },
  
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  
  avatarEmoji: {
    fontSize: 20,
  },
  
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  
});

export default PostDetailScreen;
