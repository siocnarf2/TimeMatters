import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

interface AppCategory {
  id: string;
  name: string;
  isSelected: boolean;
}

interface AppCategorySelectorProps {
  categories: AppCategory[];
  onSelectCategory: (id: string) => void;
}

export default function AppCategorySelector({ 
  categories, 
  onSelectCategory 
}: AppCategorySelectorProps) {
  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              item.isSelected && styles.selectedCategoryButton,
            ]}
            onPress={() => onSelectCategory(item.id)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                item.isSelected && styles.selectedCategoryButtonText,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: '#6366f1',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  selectedCategoryButtonText: {
    color: '#ffffff',
  },
});