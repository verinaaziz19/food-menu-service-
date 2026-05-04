'use client';

import { useAuth } from '@/lib/auth-context';
import { ProtectedLayout } from '@/app/protected-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface ProfileData {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  // Function to fetch profile data from API
  const fetchProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userId = (user as any).id || (user as any).UserID;
      console.log('Fetching profile for user ID:', userId);
      
      const response = await fetch('/api/users/profile', {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString(),
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Profile data from API:', result);
        
        if (result.success && result.data) {
          const { profile } = result.data;
          
          // Parse the full address if it contains comma-separated values
          const fullAddress = profile.Address || '';
          let addressPart = fullAddress;
          let cityPart = '';
          let postalCodePart = '';
          
          // Try to parse address if it's in format "Street, City, PostalCode"
          const addressParts = fullAddress.split(',').map(part => part.trim());
          if (addressParts.length >= 3) {
            addressPart = addressParts[0];
            cityPart = addressParts[1];
            postalCodePart = addressParts[2];
          } else if (addressParts.length === 2) {
            addressPart = addressParts[0];
            cityPart = addressParts[1];
          }
          
          setProfileData({
            name: profile.Name || (user as any).name || '',
            phone: profile.CellPhone || '',
            address: addressPart,
            city: cityPart,
            postalCode: postalCodePart,
          });
        }
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch profile data when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center text-amber-900">Loading profile...</div>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    try {
      const userId = (user as any).id || (user as any).UserID;
      
      // Clean and format phone number
      let cleanedPhone = profileData.phone.replace(/\D/g, '');
      let formattedPhone = profileData.phone;
      if (cleanedPhone.length === 10) {
        formattedPhone = `${cleanedPhone.slice(0,3)}-${cleanedPhone.slice(3,6)}-${cleanedPhone.slice(6,10)}`;
      } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith('1')) {
        formattedPhone = `${cleanedPhone.slice(0,1)}-${cleanedPhone.slice(1,4)}-${cleanedPhone.slice(4,7)}-${cleanedPhone.slice(7,11)}`;
      } else if (cleanedPhone.length > 0) {
        formattedPhone = cleanedPhone;
      }
      
      // Combine address fields into a single address string for profiles table
      let fullAddress = profileData.address;
      if (profileData.city) {
        fullAddress += `, ${profileData.city}`;
      }
      if (profileData.postalCode) {
        fullAddress += `, ${profileData.postalCode}`;
      }
      
      //apidata used for debugging and api calls
      const apiData = {
        Name: profileData.name,
        CellPhone: formattedPhone,
        Address: fullAddress,
      };

      console.log('Saving profile data:', apiData);

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString(),
        },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Save response:', result);
        
        if (updateUser && profileData.name !== (user as any).name) {
          updateUser({
            ...user,
            name: profileData.name,
          });
        }
        
        setIsEditing(false);
        
        //fetch the profile to ensure display is updated
        await fetchProfile();
        
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        console.error('Failed to update profile:', error);
        alert(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating your profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-amber-900 mb-8">Profile</h1>

          <Card className="border-2 border-amber-200">
            <div className="p-8">
              {/* Profile Header */}
              <div className="flex items-center gap-6 mb-8 pb-8 border-b-2 border-amber-200">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {profileData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-amber-700 block">Full Name</label>
                      <div className="text-sm text-amber-600 mb-1">Current: {profileData.name}</div>
                      <Input
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="border-amber-300"
                        placeholder="Your name"
                        disabled={isLoading}
                      />
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-3xl font-bold text-amber-900">{profileData.name}</h2>
                      <p className="text-amber-700 text-lg">{(user as any).email || (user as any).Email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Type Info */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="text-sm font-semibold text-amber-700 block mb-2">Account Type</label>
                  <div className="p-3 bg-amber-50 rounded border border-amber-200">
                    <p className="text-amber-900 font-semibold">
                      {(user as any).role === 'employee' || (user as any).IsAdmin === 1 ? 'Restaurant Staff' : 'Customer'}
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      {(user as any).role === 'employee' || (user as any).IsAdmin === 1
                        ? 'You have access to menu management and order updates'
                        : 'You can browse the menu and place orders'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-amber-700 block mb-2">User ID</label>
                  <div className="p-3 bg-amber-50 rounded border border-amber-200">
                    <p className="text-amber-900 font-mono text-sm break-all">{(user as any).id || (user as any).UserID}</p>
                  </div>
                </div>
              </div>

              {/* Editable Profile Information */}
              {isEditing && (
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold text-amber-900">Contact Information</h3>
                  
                  <div>
                    <label className="text-sm font-semibold text-amber-700 block mb-2">Phone Number</label>
                    <div className="text-sm text-amber-600 mb-1">Current: {profileData.phone || 'Not set'}</div>
                    <Input
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="border-amber-300"
                      placeholder="+1 (555) 123-4567"
                      type="tel"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-amber-700 block mb-2">Street Address</label>
                    <div className="text-sm text-amber-600 mb-1">Current: {profileData.address || 'Not set'}</div>
                    <Input
                      value={profileData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="border-amber-300"
                      placeholder="123 Main Street"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-amber-700 block mb-2">City</label>
                      <div className="text-sm text-amber-600 mb-1">Current: {profileData.city || 'Not set'}</div>
                      <Input
                        value={profileData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="border-amber-300"
                        placeholder="New York"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-amber-700 block mb-2">Postal Code</label>
                      <div className="text-sm text-amber-600 mb-1">Current: {profileData.postalCode || 'Not set'}</div>
                      <Input
                        value={profileData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className="border-amber-300"
                        placeholder="10001"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Display Profile Information (non-editing) */}
              {!isEditing && (
                <div className="space-y-4 mb-8 p-4 bg-amber-50 rounded border border-amber-200">
                  <h3 className="text-lg font-semibold text-amber-900">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-amber-700 font-semibold">Phone</p>
                      <p className="text-amber-900">{profileData.phone || 'Not provided'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-amber-700 font-semibold">Address</p>
                      <p className="text-amber-900">{profileData.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-amber-700 font-semibold">City</p>
                      <p className="text-amber-900">{profileData.city || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-amber-700 font-semibold">Postal Code</p>
                      <p className="text-amber-900">{profileData.postalCode || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSaveProfile}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        fetchProfile(); // Reload original data
                      }}
                      variant="outline"
                      className="w-full"
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Edit Profile
                    </Button>
                    <Button
                      onClick={() => router.push('/dashboard')}
                      variant="outline"
                      className="w-full"
                    >
                      Back to Dashboard
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <div className="p-6">
                <h3 className="font-bold text-blue-900 mb-2">About Your Account</h3>
                <p className="text-blue-800 text-sm">
                  {(user as any).role === 'employee' || (user as any).IsAdmin === 1
                    ? 'As a restaurant staff member, you can manage menu items, view all orders, and update order statuses to keep customers informed.'
                    : 'As a customer, you can browse our menu, add items to your cart, and track your orders in real-time.'}
                </p>
              </div>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50">
              <div className="p-6">
                <h3 className="font-bold text-green-900 mb-2">Need Help?</h3>
                <p className="text-green-800 text-sm">
                  If you have any questions about using Osteria, please contact our support team.
                  {((user as any).role === 'employee' || (user as any).IsAdmin === 1) && ' We\'re here to help you manage orders efficiently.'}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}