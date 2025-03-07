import api from './api';
import { User, UserRole } from './auth';

export interface Family {
  id: string;
  name: string;
  code: string;
  members: User[];
  createdAt: string;
  createdBy: string;
}

// Get family details
export async function getFamily(): Promise<Family | null> {
  try {
    // In a real implementation, this would call your API
    // const response = await api.get('/family');
    // return response.data;
    
    // Mock data for now
    return {
      id: '1',
      name: 'Famille Dupont',
      code: 'DUPONT123',
      members: [
        {
          id: '1',
          email: 'parent@example.com',
          name: 'Parent Dupont',
          role: 'parent',
          familyId: '1'
        },
        {
          id: '2',
          email: 'enfant@example.com',
          name: 'Enfant Dupont',
          role: 'player',
          familyId: '1'
        }
      ],
      createdAt: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
      createdBy: '1'
    };
  } catch (error) {
    console.error('Error fetching family:', error);
    return null;
  }
}

// Create a new family
export async function createFamily(name: string): Promise<Family> {
  try {
    // In a real implementation, this would call your API
    // const response = await api.post('/family', { name });
    // return response.data;
    
    // Mock response for now
    return {
      id: '1',
      name,
      code: 'FAMILY' + Math.floor(1000 + Math.random() * 9000), // Random 4-digit code
      members: [
        {
          id: '1',
          email: 'user@example.com',
          role: 'parent',
          familyId: '1'
        }
      ],
      createdAt: new Date().toISOString(),
      createdBy: '1'
    };
  } catch (error) {
    console.error('Error creating family:', error);
    throw error;
  }
}

// Join a family using a code
export async function joinFamily(code: string): Promise<Family> {
  try {
    // In a real implementation, this would call your API
    // const response = await api.post('/family/join', { code });
    // return response.data;
    
    // Mock response for now
    return {
      id: '1',
      name: 'Famille Dupont',
      code,
      members: [
        {
          id: '1',
          email: 'parent@example.com',
          name: 'Parent Dupont',
          role: 'parent',
          familyId: '1'
        },
        {
          id: '2',
          email: 'user@example.com',
          role: 'player',
          familyId: '1'
        }
      ],
      createdAt: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
      createdBy: '1'
    };
  } catch (error) {
    console.error('Error joining family:', error);
    throw error;
  }
}

// Leave a family
export async function leaveFamily(): Promise<void> {
  try {
    // In a real implementation, this would call your API
    // await api.post('/family/leave');
    console.log('Left family successfully');
  } catch (error) {
    console.error('Error leaving family:', error);
    throw error;
  }
}

// Update family settings
export async function updateFamilySettings(settings: {
  name?: string;
  weeklyAllowance?: number;
  inactivityRewardRate?: number;
}): Promise<Family> {
  try {
    // In a real implementation, this would call your API
    // const response = await api.put('/family/settings', settings);
    // return response.data;
    
    // Mock response for now
    return {
      id: '1',
      name: settings.name || 'Famille Dupont',
      code: 'DUPONT123',
      members: [
        {
          id: '1',
          email: 'parent@example.com',
          name: 'Parent Dupont',
          role: 'parent',
          familyId: '1'
        },
        {
          id: '2',
          email: 'enfant@example.com',
          name: 'Enfant Dupont',
          role: 'player',
          familyId: '1'
        }
      ],
      createdAt: new Date(Date.now() - 2592000000).toISOString(),
      createdBy: '1'
    };
  } catch (error) {
    console.error('Error updating family settings:', error);
    throw error;
  }
}

// Invite a user to the family
export async function inviteToFamily(email: string, role: UserRole): Promise<void> {
  try {
    // In a real implementation, this would call your API
    // await api.post('/family/invite', { email, role });
    console.log(`Invitation sent to ${email} with role ${role}`);
  } catch (error) {
    console.error('Error inviting to family:', error);
    throw error;
  }
}