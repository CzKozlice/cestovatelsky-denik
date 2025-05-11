// React & React Native
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Animated,
} from 'react-native';

// Navigace & bezpečné zóny
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Čas & lokalizace
import moment from 'moment';
import 'moment/locale/cs';

// Async & API
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, API_URL_IMAGE } from '@/constants/config';

// Komponenty a ikony
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import ImageViewing from 'react-native-image-viewing';

// Kontexty
import { useProfile } from '@/context/ProfileContext';


const typeColors = {
  TEXT: '#2196f3',
  IMAGE: '#8bc34a',
  LOCATION: '#ff9800',
};

const TripDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [trip, setTrip] = useState<any>(null);
  const [groupedPosts, setGroupedPosts] = useState<any>({});
  const [groupedPostsByImages, setGroupedPostsByImages] = useState<any>({});
  const [mainImage, setMainImage] = useState<string | null>(null);

  const [tasks, setTasks] = useState<any[]>([]);
  const [packingItems, setPackingItems] = useState<any[]>([]);
  const [newTaskModalVisible, setNewTaskModalVisible] = useState(false);
  const [newItemModalVisible, setNewItemModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNote, setNewTaskNote] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');

  const { profile } = useProfile();
  const currentUserId = profile?.id;
  const currentUser = trip?.participants.find((p: any) => p.user.id === currentUserId);
  const currentUserRole = currentUser?.role;

  const [fadeAnim] = useState(new Animated.Value(1));

  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');

  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editItemTitle, setEditItemTitle] = useState('');
  

  const getTabOptionsByRole = (role: string | undefined) => {
    if (role === 'CREATOR' || role === 'COOWNER') {
      return ['Plán', 'Galerie', 'Co zařídit', 'Co s sebou', 'Sdílení'];
    }
    return ['Plán', 'Galerie', 'Sdílení'];
  };

  const tabOptions = getTabOptionsByRole(currentUserRole);
  const [activeTab, setActiveTab] = useState('Plán');

  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('VIEWER');

  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const [allGalleryImages, setAllGalleryImages] = useState<any[]>([]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);


  const actionsMap: Record<string, () => void> = {
    'Plán': () => navigation.navigate('CreatePost', { tripId: trip.id }),
    'Galerie': () => navigation.navigate('CreatePost', { tripId: trip.id, type: 'IMAGE' }),
    'Co zařídit': () => setNewTaskModalVisible(true),
    'Co s sebou': () => setNewItemModalVisible(true),
  };

  const tabButtonColors: Record<string, string> = {
    'Plán': '#2196f3',
    'Galerie': '#64b5f6',
    'Co zařídit': '#ba68c8',
    'Co s sebou': '#ba68c8',
  };
  const floatingColor = tabButtonColors[activeTab] || '#7e57c2';

  const canEdit = currentUserRole === 'CREATOR' || currentUserRole === 'COOWNER';
  const showButton = canEdit && Object.keys(actionsMap).includes(activeTab);

  const tripId = route.params?.id || 'cma1nd0zc0000q8rgsbgjbqly';

  const fetchTrip = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/auth/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTrip(data);

      const firstImagePost = data.posts.find((p: any) => p.type === 'IMAGE' && p.imageUrl);
      setMainImage(firstImagePost ? `${API_URL_IMAGE}${firstImagePost.imageUrl}` : null);

      const grouped: any = {};
      data.posts.forEach((post: any) => {
        const date = moment(post.createdAt).format('YYYY-MM-DD');
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(post);
      });
      setGroupedPosts(grouped);

      const allImages: any[] = data.posts
        .filter((p: any) => p.type === 'IMAGE' && p.imageUrl)
        .map((p: any) => ({ uri: `${API_URL_IMAGE}${p.imageUrl}` }));

      setAllGalleryImages(allImages);

      const imageGrouped: any = {};
      data.posts
        .filter((p: any) => p.type === 'IMAGE' && p.imageUrl)
        .forEach((post: any) => {
          const date = moment(post.createdAt).format('YYYY-MM-DD');
          if (!imageGrouped[date]) imageGrouped[date] = [];
          imageGrouped[date].push(post);
        });

      setGroupedPostsByImages(imageGrouped);
    } catch (error) {
      console.error('Chyba načítání výletu:', error);
    }
  };

  const fetchTripTasks = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/auth/trips/${tripId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      console.error('Chyba načítání úkolů:', e);
    }
  };

  const fetchTripPacking = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/auth/trips/${tripId}/packing`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPackingItems(data);
    } catch (e) {
      console.error('Chyba načítání věcí:', e);
    }
  };

  const handleInvite = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/auth/trips/${tripId}/invite`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Úspěch', `Pozvánka odeslána na ${inviteEmail}`);
        setInviteModalVisible(false);
        setInviteEmail('');
        fetchTrip();
      } else {
        Alert.alert('Chyba', data.error || 'Nepodařilo se odeslat pozvánku.');
      }
    } catch (error) {
      console.error('Chyba pozvání:', error);
      Alert.alert('Chyba', 'Nepodařilo se odeslat pozvánku.');
    }
  };


  const handleCreateTask = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/auth/trips/${tripId}/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTaskTitle }),
      });
      const data = await res.json();
      setTasks((prev) => [...prev, data]);
      setNewTaskTitle('');
      setNewTaskModalVisible(false);
    } catch (e) {
      console.error('Chyba při přidání úkolu:', e);
    }
  };

  const handleEditTask = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!editTaskId) return;
  
    try {
      const res = await fetch(`${API_URL}/auth/tasks/${editTaskId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editTaskTitle }),
      });
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === editTaskId ? updated : t)));
      setEditTaskId(null);
      setEditTaskTitle('');
    } catch (e) {
      console.error('Chyba při editaci úkolu:', e);
    }
  };
  
  
  const handleToggleTask = async (id: string, completed: boolean) => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/auth/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });
      const updated = await res.json();
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updated : task))
      );
    } catch (e) {
      console.error('Chyba při označení úkolu:', e);
    }
  };
  
  const handleDeleteTask = async (id: string) => {
    const token = await AsyncStorage.getItem('token');
    try {
      await fetch(`${API_URL}/auth/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error('Chyba při mazání úkolu:', e);
    }
  };
  
  const handleCreateItem = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/auth/trips/${tripId}/packing`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newItemTitle }),
      });
      const data = await res.json();
      setPackingItems((prev) => [...prev, data]);
      setNewItemTitle('');
      setNewItemModalVisible(false);
    } catch (e) {
      console.error('Chyba při přidání věci:', e);
    }
  };

  const handleEditItem = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!editItemId) return;
  
    try {
      const res = await fetch(`${API_URL}/auth/packing/${editItemId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editItemTitle }),
      });
      const updated = await res.json();
      setPackingItems((prev) => prev.map((i) => (i.id === editItemId ? updated : i)));
      setEditItemId(null);
      setEditItemTitle('');
    } catch (e) {
      console.error('Chyba při editaci věci:', e);
    }
  };

  
  const handleToggleItem = async (id: string, completed: boolean) => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/auth/packing/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });
      const updated = await res.json();
      setPackingItems((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch (e) {
      console.error('Chyba při označení věci:', e);
    }
  };
  
  const handleDeleteItem = async (id: string) => {
    const token = await AsyncStorage.getItem('token');
    try {
      await fetch(`${API_URL}/auth/packing/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setPackingItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      console.error('Chyba při mazání věci:', e);
    }
  };
  
useEffect(() => {
  if (isFocused) {
    fetchTrip();
    fetchTripTasks();
    fetchTripPacking();
  }
}, [isFocused]);

useEffect(() => {
  if (allGalleryImages.length === 0) return;

  const interval = setInterval(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allGalleryImages.length);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });
  }, 5000);

  return () => clearInterval(interval);
}, [allGalleryImages]);





  if (!trip) return null;
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          <View style={styles.imageCarousel}>
          {allGalleryImages.length > 0 ? (
            <Animated.Image
              source={{ uri: allGalleryImages[currentImageIndex]?.uri }}
              style={[styles.carouselImage, { opacity: fadeAnim }]}
              resizeMode="cover"
            />

          ) : (
            <View style={[styles.carouselImage, { backgroundColor: '#ccc' }]} />
          )}

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#5C55E1" />
          </TouchableOpacity>

          {(currentUserRole === 'CREATOR' || currentUserRole === 'COOWNER') && (
            <TouchableOpacity
              onPress={() => navigation.navigate('EditTripScreen', { tripId: trip.id })}
              style={styles.editButton}
            >
              <Feather name="edit-3" size={20} color="#5C55E1" />
            </TouchableOpacity>
          )}

          <View style={styles.imageTextOverlay}>
            <Text style={styles.title}>{trip.name}</Text>
            <Text style={styles.date}>
              {moment(trip.startDate).format('D.M.YYYY')} – {moment(trip.endDate).format('D.M.YYYY')}
            </Text>
          </View>
        </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsContainer}
          >
            {trip.countries.map((tc: any) => (
              <Text key={tc.country.id} style={styles.tag}>{tc.country.name}</Text>
            ))}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            {tabOptions.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && { backgroundColor: '#7e57c2' }]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && { color: 'white' }]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {activeTab === 'Plán' && (
            Object.entries(groupedPosts).map(([date, posts]: any) => (
              <View key={date} style={{ marginTop: 20 }}>
                <Text style={styles.dayTitle}>{moment(date).format('D.M.YYYY')}</Text>
                {posts.map((post: any, idx: number) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.timelineItem}
                    onPress={() => navigation.navigate('PostDetail', { id: post.id })}
                  >
                    <View style={[styles.bullet, { backgroundColor: typeColors[post.type] || '#ccc' }]} />
                    <View style={styles.content}>
                      <Text style={styles.typeText}>
                        {post.type === 'TEXT' ? 'Poznámka' : post.type === 'IMAGE' ? 'Obrázek' : 'Místo'} - {moment(post.date || post.createdAt).format('HH:mm')}
                      </Text>
                      {post.content && <Text>{post.content}</Text>}
                      {post.imageUrl && <Text>📷 Obrázek přiložen</Text>}
                      {post.location && <Text>📍 {post.location}</Text>}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          )}

          {activeTab === 'Galerie' && (
            Object.entries(groupedPostsByImages).map(([date, posts]: any) => (
              <View key={date} style={{ marginBottom: 24 }}>
                <Text style={styles.dayTitle}>{moment(date).format('D.M.YYYY')}</Text>
                <View style={styles.galleryGrid}>
                  {posts.map((post: any, idx: number) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => {
                        const globalIndex = allGalleryImages.findIndex(img => img.uri === `${API_URL_IMAGE}${post.imageUrl}`);
                        setImageViewerIndex(globalIndex);
                        setIsImageViewerVisible(true);
                      }}
                    >
                      <Image
                        source={{ uri: `${API_URL_IMAGE}${post.imageUrl}` }}
                        style={styles.galleryImage}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          )}

          {activeTab === 'Co zařídit' && (
            <View style={{ paddingHorizontal: 15, paddingBottom: 80 }}>
              {tasks.map((task) => (
                <View
                  key={task.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                    justifyContent: 'space-between',
                  }}
                >
                  <TouchableOpacity onPress={() => handleToggleTask(task.id, !task.completed)}>
                    <Feather
                      name={task.completed ? 'check-square' : 'square'}
                      size={20}
                      color={task.completed ? '#5C55E1' : '#999'}
                    />
                  </TouchableOpacity>

                  <Text
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      textDecorationLine: task.completed ? 'line-through' : 'none',
                    }}
                    numberOfLines={2}
                  >
                    {task.title}
                  </Text>

                  {(currentUserRole === 'CREATOR' || currentUserRole === 'COOWNER') && (
                      <>
                        <TouchableOpacity
                          onPress={() => {
                            setEditTaskId(task.id);
                            setEditTaskTitle(task.title);
                          }}
                          style={{ padding: 8 }}
                        >
                          <Feather name="edit-3" size={16} color="#555" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            Alert.alert(
                              'Smazat úkol',
                              'Opravdu chceš tento úkol smazat?',
                              [
                                { text: 'Zrušit', style: 'cancel' },
                                {
                                  text: 'Smazat',
                                  style: 'destructive',
                                  onPress: () => handleDeleteTask(task.id),
                                },
                              ]
                            );
                          }}
                          style={{ padding: 8 }}
                        >
                          <Feather name="trash-2" size={16} color="#c00" />
                        </TouchableOpacity>
                      </>
                    )}

                </View>

              ))}
            </View>
          )}

          {activeTab === 'Co s sebou' && (
            <View style={{ paddingHorizontal: 15, paddingBottom: 80 }}>
            {packingItems.map((item) => (
              <View
                key={item.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                  justifyContent: 'space-between',
                }}
              >
                <TouchableOpacity onPress={() => handleToggleItem(item.id, !item.completed)}>
                  <Feather
                    name={item.completed ? 'check-square' : 'square'}
                    size={20}
                    color={item.completed ? '#5C55E1' : '#999'}
                  />
                </TouchableOpacity>

                <Text
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    textDecorationLine: item.completed ? 'line-through' : 'none',
                  }}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>

                {(currentUserRole === 'CREATOR' || currentUserRole === 'COOWNER') && (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        setEditItemId(item.id);
                        setEditItemTitle(item.title);
                      }}
                      style={{ padding: 8 }}
                    >
                      <Feather name="edit-3" size={16} color="#555" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          'Smazat položku',
                          'Opravdu chceš položku smazat?',
                          [
                            { text: 'Zrušit', style: 'cancel' },
                            {
                              text: 'Smazat',
                              style: 'destructive',
                              onPress: () => handleDeleteItem(item.id),
                            },
                          ]
                        );
                      }}
                      style={{ padding: 8 }}
                    >
                      <Feather name="trash-2" size={16} color="#c00" />
                    </TouchableOpacity>
                  </>
                )}

              </View>
            ))}
            </View>
          )}



          {activeTab === 'Sdílení' && (
            <View style={{ paddingHorizontal: 20, marginTop: 10, paddingBottom: 80 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#ccc' }}>
                <Text style={{ fontWeight: 'bold' }}>Uživatel</Text>
                <Text style={{ fontWeight: 'bold' }}>Role</Text>
              </View>
          
              {trip.participants.map((p: any) => {
                const roleMap: Record<string, string> = {
                  CREATOR: 'Autor',
                  COOWNER: 'Spolucestovatel',
                  VIEWER: 'Pozorovatel',
                };

                const handleRemove = () => {
                  Alert.alert(
                    'Odebrat účastníka',
                    `Opravdu chceš odebrat uživatele ${p.user.username}?`,
                    [
                      { text: 'Zrušit', style: 'cancel' },
                      {
                        text: 'Odebrat',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            const token = await AsyncStorage.getItem('token');
                            const res = await fetch(`${API_URL}/auth/trips/${tripId}/users/${p.user.id}`, {
                              method: 'DELETE',
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            });
                            const result = await res.json();
                            if (res.ok) {
                              Alert.alert('Hotovo', 'Uživatel byl odebrán.');
                              fetchTrip();
                            } else {
                              Alert.alert('Chyba', result.error || 'Nepodařilo se odebrat.');
                            }
                          } catch (e) {
                            Alert.alert('Chyba', 'Nastala chyba při odebírání uživatele.');
                          }
                        },
                      },
                    ]
                  );
                };
          
                return (
                  <View
                    key={p.user.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderColor: '#f0f0f0',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: '#eee',
                          justifyContent: 'center',
                          alignItems: 'center',
                          overflow: 'hidden',
                          marginRight: 10,
                        }}
                      >
                        {p.user.avatarUrl ? (
                          <Image
                            source={{ uri: `${API_URL_IMAGE}${p.user.avatarUrl}` }}
                            style={{ width: 36, height: 36 }}
                          />
                        ) : (
                          <Text style={{ fontSize: 18 }}>👤</Text>
                        )}
                      </View>
                      <Text>{p.user.username}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text>{roleMap[p.role] || p.role}</Text>
                      {(
                        (currentUserRole === 'CREATOR' && p.user.id !== currentUserId) ||
                        (currentUserRole === 'COOWNER' && p.role === 'VIEWER' && p.user.id !== currentUserId)
                      ) && (
                        <TouchableOpacity onPress={handleRemove}>
                          <Feather name="user-minus" size={18} style={{ marginLeft: 12, color: '#666' }} />
                        </TouchableOpacity>
                      )}

                    </View>
                  </View>
                );
              })}
            </View>
          )}
          
        </ScrollView>

        {showButton && (
          <TouchableOpacity
            style={[styles.floatingButton, { backgroundColor: floatingColor }]}
            onPress={actionsMap[activeTab]}
          >
          <Text style={styles.floatingButtonText}>
            {activeTab === 'Plán'
              ? '➕ Přidat příspěvek'
              : activeTab === 'Galerie'
              ? '➕ Přidat obrázek'
              : activeTab === 'Co zařídit'
              ? '➕ Přidat úkol'
              : '➕ Přidat položku'}
          </Text>

          </TouchableOpacity>
        )}


        {activeTab === 'Sdílení' &&
          (currentUserRole === 'CREATOR' || currentUserRole === 'COOWNER') && (
            <TouchableOpacity
              style={[styles.floatingButton, { backgroundColor: '#c5e1a5' }]}
              onPress={() => setInviteModalVisible(true)}
            >
              <Text style={[styles.floatingButtonText, { color: '#000' }]}>👥 Pozvat účastníky</Text>
            </TouchableOpacity>
        )}
        
        <Modal
          visible={inviteModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setInviteModalVisible(false)}
        >
          <View style={{
            flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'
          }}>
            
            <View style={{
              backgroundColor: '#fff', padding: 20, width: '80%', borderRadius: 10
            }}>
            <TouchableOpacity
              onPress={() => setInviteModalVisible(false)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 10,
              }}
            >
              <Feather name="x" size={24} color="#555" />
            </TouchableOpacity>
              <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Pozvat uživatele</Text>
              <TextInput
                placeholder="Email uživatele"
                value={inviteEmail}
                onChangeText={setInviteEmail}
                style={{
                  borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
                  padding: 10, marginBottom: 15,
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={{ marginBottom: 5 }}>Role uživatele</Text>
              <View style={{
                borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 15
              }}>
                <Picker selectedValue={inviteRole} onValueChange={(val) => setInviteRole(val)}>
                  <Picker.Item label="Spolucestovatel" value="COOWNER" />
                  <Picker.Item label="Pozorovatel" value="VIEWER" />
                </Picker>
              </View>
              <TouchableOpacity
                onPress={handleInvite}
                style={{
                  backgroundColor: '#4caf50',
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Pozvat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


        <Modal
          visible={newTaskModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setNewTaskModalVisible(false)}
        >
          <View style={{
            flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'
          }}>
            <View style={{
              backgroundColor: '#fff', padding: 20, width: '80%', borderRadius: 10
            }}>
              <TouchableOpacity
                onPress={() => setNewTaskModalVisible(false)}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  zIndex: 10,
                }}
              >
                <Feather name="x" size={24} color="#555" />
              </TouchableOpacity>
              <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Nový úkol</Text>
              <TextInput
                placeholder="Název úkolu"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                style={{
                  borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
                  padding: 10, marginBottom: 15,
                }}
              />
              <TouchableOpacity
                onPress={handleCreateTask}
                style={{
                  backgroundColor: '#4caf50',
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Přidat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


          <Modal
            visible={newItemModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setNewItemModalVisible(false)}
          >
            <View style={{
              flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'
            }}>
              <View style={{
                backgroundColor: '#fff', padding: 20, width: '80%', borderRadius: 10
              }}>
                <TouchableOpacity
                  onPress={() => setNewItemModalVisible(false)}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 10,
                  }}
                >
                  <Feather name="x" size={24} color="#555" />
                </TouchableOpacity>
                <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Nová položka</Text>
                <TextInput
                  placeholder="Co si vzít s sebou"
                  value={newItemTitle}
                  onChangeText={setNewItemTitle}
                  style={{
                    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
                    padding: 10, marginBottom: 15,
                  }}
                />
                <TouchableOpacity
                  onPress={handleCreateItem}
                  style={{
                    backgroundColor: '#4caf50',
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Přidat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>



          <Modal
            visible={!!editTaskId}
            transparent
            animationType="slide"
            onRequestClose={() => setEditTaskId(null)}
          >
            <View style={{
              flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'
            }}>
              <View style={{
                backgroundColor: '#fff', padding: 20, width: '80%', borderRadius: 10
              }}>
                <TouchableOpacity
                  onPress={() => setEditTaskId(null)}
                  style={{ position: 'absolute', top: 10, right: 10 }}
                >
                  <Feather name="x" size={24} color="#555" />
                </TouchableOpacity>
                <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Upravit úkol</Text>
                <TextInput
                  placeholder="Nový název"
                  value={editTaskTitle}
                  onChangeText={setEditTaskTitle}
                  style={{
                    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
                    padding: 10, marginBottom: 15,
                  }}
                />
                <TouchableOpacity
                  onPress={handleEditTask}
                  style={{
                    backgroundColor: '#4caf50',
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Uložit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>


          <Modal
            visible={!!editItemId}
            transparent
            animationType="slide"
            onRequestClose={() => setEditItemId(null)}
          >
            <View style={{
              flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'
            }}>
              <View style={{
                backgroundColor: '#fff', padding: 20, width: '80%', borderRadius: 10
              }}>
                <TouchableOpacity
                  onPress={() => setEditItemId(null)}
                  style={{ position: 'absolute', top: 10, right: 10 }}
                >
                  <Feather name="x" size={24} color="#555" />
                </TouchableOpacity>
                <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Upravit položku</Text>
                <TextInput
                  placeholder="Nový název"
                  value={editItemTitle}
                  onChangeText={setEditItemTitle}
                  style={{
                    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
                    padding: 10, marginBottom: 15,
                  }}
                />
                <TouchableOpacity
                  onPress={handleEditItem}
                  style={{
                    backgroundColor: '#4caf50',
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Uložit</Text>
                  
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        <ImageViewing
          images={allGalleryImages}
          imageIndex={imageViewerIndex}
          visible={isImageViewerVisible}
          onRequestClose={() => setIsImageViewerVisible(false)}
          swipeToCloseEnabled={true}
        />

      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: { backgroundColor: '#fff' },
  image: { height: 180, justifyContent: 'flex-end', padding: 15 },
  title: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
  date: { fontSize: 14, color: '#fff' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 15, marginTop: 10 },
  tag: {
    backgroundColor: '#c5e1a5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  tab: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  bullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    marginRight: 10,
  },
  content: { flex: 1 },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  editButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  tabsContainer: {
    paddingHorizontal: 10,
    marginVertical: 15,
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 10,
  },
  tagsContainer: {
    paddingHorizontal: 15,
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingBottom: 4,
  },
  typeText: { fontWeight: 'bold', marginBottom: 2 },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#7e57c2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
  },
  floatingButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 15,
    marginTop: 8,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  imageCarousel: {
    height: 180,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  
  carouselImage: {
    width: '100%',
    height: 180,
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#111',
  },
  
  imageTextOverlay: {
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  
});


export default TripDetailScreen;
