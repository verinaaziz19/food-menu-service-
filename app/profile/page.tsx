'use client';

import { useAuth } from '@/lib/auth-context';
import { ProtectedLayout } from '@/app/protected-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface ProfileData {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || '',
    phone: localStorage.getItem(`profile_${user?.id}_phone`) || '',
    address: localStorage.getItem(`profile_${user?.id}_address`) || '',
    city: localStorage.getItem(`profile_${user?.id}_city`) || '',
    postalCode: localStorage.getItem(`profile_${user?.id}_postalCode`) || '',
  });

  if (!user) {
    return null;
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    // TODO: Replace this localStorage implementation with API call:
    // const response = await fetch('/api/users/profile', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(profileData)
    // });
    // const updated = await response.json();

    // Current localStorage implementation (for demo purposes)
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = storedUsers.map((u: any) => 
      u.id === user.id ? { ...u, name: profileData.name } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Save additional profile data
    localStorage.setItem(`profile_${user.id}_phone`, profileData.phone);
    localStorage.setItem(`profile_${user.id}_address`, profileData.address);
    localStorage.setItem(`profile_${user.id}_city`, profileData.city);
    localStorage.setItem(`profile_${user.id}_postalCode`, profileData.postalCode);

    // Update current user in localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentUser.name = profileData.name;
    localStorage.setItem('user', JSON.stringify(currentUser));

    setIsEditing(false);
    window.location.reload();
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
                      <Input
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="border-amber-300"
                        placeholder="Your name"
                      />
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-3xl font-bold text-amber-900">{profileData.name}</h2>
                      <p className="text-amber-700 text-lg">{user.email}</p>
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
                      {user.role === 'employee' ? 'Restaurant Staff' : 'Customer'}
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      {user.role === 'employee'
                        ? 'You have access to menu management and order updates'
                        : 'You can browse the menu and place orders'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-amber-700 block mb-2">User ID</label>
                  <div className="p-3 bg-amber-50 rounded border border-amber-200">
                    <p className="text-amber-900 font-mono text-sm break-all">{user.id}</p>
                  </div>
                </div>
              </div>

              {/* Editable Profile Information */}
              {isEditing && (
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold text-amber-900">Contact & Address Information</h3>
                  
                  <div>
                    <label className="text-sm font-semibold text-amber-700 block mb-2">Phone Number</label>
                    <Input
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="border-amber-300"
                      placeholder="+1 (555) 123-4567"
                      type="tel"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-amber-700 block mb-2">Street Address</label>
                    <Input
                      value={profileData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="border-amber-300"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-amber-700 block mb-2">City</label>
                      <Input
                        value={profileData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="border-amber-300"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-amber-700 block mb-2">Postal Code</label>
                      <Input
                        value={profileData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className="border-amber-300"
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Display Profile Information (non-editing) */}
              {!isEditing && (profileData.phone || profileData.address || profileData.city || profileData.postalCode) && (
                <div className="space-y-4 mb-8 p-4 bg-amber-50 rounded border border-amber-200">
                  <h3 className="text-lg font-semibold text-amber-900">Contact & Address Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {profileData.phone && (
                      <div>
                        <p className="text-amber-700 font-semibold">Phone</p>
                        <p className="text-amber-900">{profileData.phone}</p>
                      </div>
                    )}
                    {profileData.address && (
                      <div>
                        <p className="text-amber-700 font-semibold">Address</p>
                        <p className="text-amber-900">{profileData.address}</p>
                      </div>
                    )}
                    {profileData.city && (
                      <div>
                        <p className="text-amber-700 font-semibold">City</p>
                        <p className="text-amber-900">{profileData.city}</p>
                      </div>
                    )}
                    {profileData.postalCode && (
                      <div>
                        <p className="text-amber-700 font-semibold">Postal Code</p>
                        <p className="text-amber-900">{profileData.postalCode}</p>
                      </div>
                    )}
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
                    >
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setProfileData({
                          name: user.name,
                          phone: localStorage.getItem(`profile_${user.id}_phone`) || '',
                          address: localStorage.getItem(`profile_${user.id}_address`) || '',
                          city: localStorage.getItem(`profile_${user.id}_city`) || '',
                          postalCode: localStorage.getItem(`profile_${user.id}_postalCode`) || '',
                        });
                      }}
                      variant="outline"
                      className="w-full"
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
                  {user.role === 'employee'
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
                  {user.role === 'employee' && ' We&apos;re here to help you manage orders efficiently.'}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
