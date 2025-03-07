import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useAuthStore } from '@/services/auth';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<'child' | 'parent'>('child');
  
  const { login, register, isLoading, error } = useAuthStore();
  
  const handleSubmit = async () => {
    if (!email || !password) {
      return;
    }
    
    try {
      if (isRegistering) {
        await register(email, password, role);
      } else {
        await login(email, password);
      }
      
      router.replace('/');
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dGltZXxlbnwwfHwwfHx8MA%3D%3D' }} 
          style={styles.logo}
        />
        <Text style={styles.appName}>Temps d'Écran</Text>
        <Text style={styles.tagline}>Gérez le temps d'écran en s'amusant</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>
          {isRegistering ? 'Créer un compte' : 'Connexion'}
        </Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
        </View>
        
        {isRegistering && (
          <View style={styles.roleContainer}>
            <Text style={styles.inputLabel}>Je suis un</Text>
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'child' && styles.activeRoleButton,
                ]}
                onPress={() => setRole('child')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'child' && styles.activeRoleButtonText,
                  ]}
                >
                  Enfant
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'parent' && styles.activeRoleButton,
                ]}
                onPress={() => setRole('parent')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'parent' && styles.activeRoleButtonText,
                  ]}
                >
                  Parent
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isRegistering ? 'Créer mon compte' : 'Se connecter'}
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.switchModeButton}
          onPress={() => setIsRegistering(!isRegistering)}
        >
          <Text style={styles.switchModeText}>
            {isRegistering 
              ? 'Déjà un compte ? Se connecter' 
              : 'Pas encore de compte ? S\'inscrire'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
  },
  tagline: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 2,
    marginTop: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeRoleButton: {
    backgroundColor: '#6366f1',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  activeRoleButtonText: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchModeButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchModeText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
});