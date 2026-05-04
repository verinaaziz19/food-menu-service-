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

  const isEmployee =
    (user as any)?.role === 'employee' || (user as any)?.IsAdmin === 1;

  const userId = (user as any)?.id || (user as any)?.UserID;
  const userEmail = (user as any)?.email || (user as any)?.Email;

  const fetchProfile = async () => {
    if (!user || !userId) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString(),
        },
      });

      if (response.ok) {
        const result = await response.json();

        if (result.success && result.data) {
          const profile = result.data.profile;
          const fullAddress = profile.Address || '';

          let addressPart = fullAddress;
          let cityPart = '';
          let postalCodePart = '';

          const addressParts = fullAddress.split(',').map((part: string) => part.trim());

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
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);

    try {
      const cleanedPhone = profileData.phone.replace(/\D/g, '');
      let formattedPhone = profileData.phone;

      if (cleanedPhone.length === 10) {
        formattedPhone = `${cleanedPhone.slice(0, 3)}-${cleanedPhone.slice(3, 6)}-${cleanedPhone.slice(6, 10)}`;
      }

      let fullAddress = profileData.address;

      if (profileData.city) {
        fullAddress += `, ${profileData.city}`;
      }

      if (profileData.postalCode) {
        fullAddress += `, ${profileData.postalCode}`;
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString(),
        },
        body: JSON.stringify({
          Name: profileData.name,
          CellPhone: formattedPhone,
          Address: fullAddress,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to update profile');
        return;
      }

      updateUser({
        ...user,
        name: profileData.name,
      });

      setIsEditing(false);
      await fetchProfile();
      alert('Profile updated successfully!');
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
              <div className="flex items-center gap-6 mb-8 pb-8 border-b-2 border-amber-200">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {(profileData.name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-amber-700 block">Full Name</label>
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
                      <h2 className="text-3xl font-bold text-amber-900">
                        {profileData.name || 'User'}
                      </h2>
                      <p className="text-amber-700 text-lg">{userEmail}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="text-sm font-semibold text-amber-700 block mb-2">
                    Account Type
                  </label>
                  <div className="p-3 bg-amber-50 rounded border border-amber-200">
                    <p className="text-amber-900 font-semibold">
                      {isEmployee ? 'Restaurant Staff' : 'Customer'}
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      {isEmployee
                        ? 'You have access to menu management and order updates'
                        : 'You can browse the menu and place orders'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-amber-700 block mb-2">
                    User ID
                  </label>
                  <div className="p-3 bg-amber-50 rounded border border-amber-200">
                    <p className="text-amber-900 font-mono text-sm break-all">{userId}</p>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold text-amber-900">Contact Information</h3>

                  <div>
                    <label className="text-sm font-semibold text-amber-700 block mb-2">
                      Phone Number
                    </label>
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
                    <label className="text-sm font-semibold text-amber-700 block mb-2">
                      Street Address
                    </label>
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
                      <Input
                        value={profileData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="border-amber-300"
                        placeholder="Nashville"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-amber-700 block mb-2">
                        Postal Code
                      </label>
                      <Input
                        value={profileData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className="border-amber-300"
                        placeholder="37201"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              )}

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
                        fetchProfile();
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <div className="p-6">
                <h3 className="font-bold text-blue-900 mb-2">About Your Account</h3>
                <p className="text-blue-800 text-sm">
                  {isEmployee
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
                  {isEmployee && " We're here to help you manage orders efficiently."}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}