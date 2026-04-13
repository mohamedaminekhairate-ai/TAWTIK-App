import React, { useState, useMemo, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, StatusBar, Animated } from 'react-native';
import { Stack } from 'expo-router';
import SearchBar from '../components/SearchBar';
import CardItem from '../components/CardItem';
import data from '../tawtik_api_v2.json';

// ─── ANIMATED ITEM WRAPPER ──────────────────────────────────────────────────
function AnimatedItem({ children, index }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay: index * 60, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay: index * 60, useNativeDriver: true, speed: 12, bounciness: 4 }),
    ]).start();
  }, [index]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

const DaamSakanScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data.DAAMSAKAN.filter(item => 
      Object.values(item).some(val => 
        val && val.toString().toLowerCase().includes(query)
      )
    );
  }, [searchQuery]);

  const renderItem = ({ item, index }) => {
    const details = [
      { label: 'Bénéficiaire', value: item.nom_beneficier },
      { label: 'Promoteur', value: item.namepromoteur },
      { label: 'Référence', value: item.demande_ref },
    ];

    return (
      <AnimatedItem index={index}>
        <CardItem
          title={item.demande_ref}
          status={item.state}
          details={details}
          type="DAAMSAKAN"
        />
      </AnimatedItem>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Rechercher par réf, nom ou statut..."
      />

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune demande trouvée</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94a3b8',
  },
});

export default DaamSakanScreen;
