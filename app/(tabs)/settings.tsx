import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useAppSettingsStore } from '@/store/settingsStore';
import { useScreenTimeStore } from '@/store/screenTimeStore';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/services/auth';
import { Settings, User, Users, Clock, Bell, Shield, LogOut } from 'lucide-react-native';

export default function SettingsScreen() {
  const { 
    userRole, 
    setUserRole, 
    familyCode,
    setFamilyCode,
    weeklyAllowance,
    setWeeklyAllowance,
    inactivityRewardRate,
    setInactivityRewardRate,
    parentCode,
    setParentCode,
    verifyParentCode,
    fetchFamilySettings,
    isLoading: settingsLoading,
    error: settingsError
  } = useAppSettingsStore();
  
  const { resetScreenTime } = useScreenTimeStore();
  
  const {
    apps,
    fetchApps,
    toggleAppTracking,
    isLoading: appsLoading,
    error: appsError
  } = useAppStore();
  
  const { logout, user } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFamilyCodeInput, setShowFamilyCodeInput] = useState(false);
  const [tempFamilyCode, setTempFamilyCode] = useState('');
  const [tempWeeklyAllowance, setTempWeeklyAllowance] = useState(weeklyAllowance.toString());
  const [tempInactivityRate, setTempInactivityRate] = useState(inactivityRewardRate.toString());
  const [tempParentCode, setTempParentCode] = useState('');
  const [showParentCodeInput, setShowParentCodeInput] = useState(false);
  const [parentCodeVerification, setParentCodeVerification] = useState('');
  const [showParentCodeVerification, setShowParentCodeVerification] = useState(false);
  
  // Fetch apps and family settings on component mount
  useEffect(() => {
    fetchApps().catch(error => {
      console.error('Failed to fetch apps:', error);
    });
    
    fetchFamilySettings().catch(error => {
      console.error('Failed to fetch family settings:', error);
    });
  }, [fetchApps, fetchFamilySettings]);
  
  // Filter apps based on search query
  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Save family code
  const saveFamilyCode = async () => {
    if (tempFamilyCode.trim()) {
      await setFamilyCode(tempFamilyCode);
      setShowFamilyCodeInput(false);
    }
  };
  
  // Save weekly allowance
  const saveWeeklyAllowance = async () => {
    const allowance = parseInt(tempWeeklyAllowance, 10);
    if (!isNaN(allowance) && allowance >= 0) {
      await setWeeklyAllowance(allowance);
    }
  };
  
  // Save inactivity reward rate
  const saveInactivityRate = async () => {
    const rate = parseInt(tempInactivityRate, 10);
    if (!isNaN(rate) && rate >= 0) {
      await setInactivityRewardRate(rate);
    }
  };
  
  // Save parent code
  const saveParentCode = async () => {
    if (tempParentCode.trim() && tempParentCode.length >= 4) {
      await setParentCode(tempParentCode);
      setShowParentCodeInput(false);
      Alert.alert("Code parent", "Le code parent a été défini avec succès.");
    } else {
      Alert.alert("Erreur", "Le code parent doit contenir au moins 4 caractères.");
    }
  };
  
  // Verify parent code to switch role
  const handleVerifyParentCode = async () => {
    if (await verifyParentCode(parentCodeVerification)) {
      setUserRole(userRole === 'parent' ? 'player' : 'parent');
      setShowParentCodeVerification(false);
      setParentCodeVerification('');
      Alert.alert(
        "Mode changé",
        `Vous êtes maintenant en mode ${userRole === 'parent' ? 'enfant' : 'parent'}`
      );
    } else {
      Alert.alert("Erreur", "Code parent incorrect.");
    }
  };
  
  // Handle role switch attempt
  const handleRoleSwitch = () => {
    if (userRole === 'player') {
      // Player trying to become parent - needs verification
      setShowParentCodeVerification(true);
    } else {
      // Parent can switch to player directly
      setUserRole('player');
      Alert.alert(
        "Mode changé",
        "Vous êtes maintenant en mode enfant"
      );
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // In a real app, this would navigate to the login screen
      console.log('User logged out');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  if (settingsLoading && appsLoading && apps.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Chargement des paramètres...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      {(settingsError || appsError) && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{settingsError || appsError}</Text>
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <User size={20} color="#1e293b" /> Profil
        </Text>
        
        <View style={styles.card}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Mode actuel</Text>
            <TouchableOpacity
              style={[
                styles.roleButton,
                userRole === 'parent' && styles.parentRoleButton
              ]}
              onPress={handleRoleSwitch}
            >
              <Text style={[
                styles.roleButtonText,
                userRole === 'parent' && styles.parentRoleButtonText
              ]}>
                {userRole === 'parent' ? 'Parent' : 'Enfant'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {user && (
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Email</Text>
              <Text style={styles.settingValue}>{user.email}</Text>
            </View>
          )}
        </View>
      </View>
      
      {userRole === 'parent' && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Clock size={20} color="#1e293b" /> Temps d'écran
            </Text>
            
            <View style={styles.card}>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Temps hebdomadaire (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={tempWeeklyAllowance}
                  onChangeText={setTempWeeklyAllowance}
                  onBlur={saveWeeklyAllowance}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Minutes par heure d'inactivité</Text>
                <TextInput
                  style={styles.input}
                  value={tempInactivityRate}
                  onChangeText={setTempInactivityRate}
                  onBlur={saveInactivityRate}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Shield size={20} color="#1e293b" /> Sécurité
            </Text>
            
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => setShowParentCodeInput(true)}
              >
                <Text style={styles.settingLabel}>Modifier le code parent</Text>
                <Text style={styles.settingAction}>Modifier</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
      
      {showParentCodeVerification && (
        <View style={styles.overlayCard}>
          <Text style={styles.overlayTitle}>Entrez le code parent</Text>
          <TextInput
            style={styles.codeInput}
            value={parentCodeVerification}
            onChangeText={setParentCodeVerification}
            placeholder="Code parent"
            secureTextEntry
            keyboardType="numeric"
          />
          <View style={styles.overlayActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowParentCodeVerification(false);
                setParentCodeVerification('');
              }}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleVerifyParentCode}
            >
              <Text style={styles.saveButtonText}>Vérifier</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {showParentCodeInput && (
        <View style={styles.overlayCard}>
          <Text style={styles.overlayTitle}>Nouveau code parent</Text>
          <TextInput
            style={styles.codeInput}
            value={tempParentCode}
            onChangeText={setTempParentCode}
            placeholder="Nouveau code"
            secureTextEntry
            keyboardType="numeric"
          />
          <View style={styles.overlayActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowParentCodeInput(false);
                setTempParentCode('');
              }}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveParentCode}
            >
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Settings size={20} color="#1e293b" /> Applications
        </Text>
        
        <View style={styles.card}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher une application..."
          />
          
          {filteredApps.map(app => (
            <View key={app.id} style={styles.appItem}>
              <View style={styles.appInfo}>
                <Text style={styles.appIcon}>{app.icon}</Text>
                <Text style={styles.appName}>{app.name}</Text>
              </View>
              {userRole === 'parent' ? (
                <Switch
                  value={app.isTracked}
                  onValueChange={() => toggleAppTracking(app.id)}
                  trackColor={{ false: '#e2e8f0', true: '#a5b4fc' }}
                  thumbColor={app.isTracked ? '#6366f1' : '#f4f4f5'}
                />
              ) : (
                <Text style={[
                  styles.appStatus,
                  app.isTracked ? styles.appStatusTracked : styles.appStatusUntracked
                ]}>
                  {app.isTracked ? 'Décompté' : 'Non décompté'}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  overlayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  codeInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  overlayActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  settingValue: {
    fontSize: 16,
    color: '#64748b',
  },
  settingAction: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: 80,
    textAlign: 'center',
  },
  roleButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  parentRoleButton: {
    backgroundColor: '#6366f1',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  parentRoleButtonText: {
    color: '#ffffff',
  },
  searchInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  appName: {
    fontSize: 16,
    color: '#1e293b',
  },
  appStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  appStatusTracked: {
    color: '#6366f1',
  },
  appStatusUntracked: {
    color: '#94a3b8',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
});