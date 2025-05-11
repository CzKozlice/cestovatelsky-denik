import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  countries: any[];
  selected: string | string[];
  toggleCountry: (countryId: string) => void;
  singleSelect?: boolean;
}

export default function CountryPickerModal({
  visible,
  onClose,
  countries,
  selected,
  toggleCountry,
  singleSelect = false,
}: Props) {
  const isSelected = (id: string) => {
    return singleSelect ? selected === id : (selected as string[]).includes(id);
  };

  const handleToggle = (id: string) => {
    toggleCountry(id);
    if (singleSelect) {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Vyber {singleSelect ? 'zemi' : 'plánované země'}</Text>
        <ScrollView>
          {countries.map((country) => (
            <TouchableOpacity
              key={country.id}
              style={[
                styles.countryItem,
                isSelected(country.id) && styles.selectedItem,
              ]}
              onPress={() => handleToggle(country.id)}
            >
              <Text>{country.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {!singleSelect && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Vybrat</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  countryItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  selectedItem: {
    backgroundColor: '#eee',
  },
  closeButton: {
    backgroundColor: '#4fc3f7',
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    borderRadius: 10,
  },
});
