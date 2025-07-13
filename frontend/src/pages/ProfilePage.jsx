import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const ProfilePage = () => {
    const { user, loading: authLoading } = useAuth(); // Get user and authLoading from AuthContext

    // Function to generate a random background color for the avatar
    const getRandomColor = (seed) => {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    };

    // Derive initials and avatar color from user data
    const userInitials = user?.name ? user.name.substring(0, 2).toUpperCase() : (user?.email ? user.email.substring(0, 2).toUpperCase() : '??');
    const avatarColor = user?.name ? getRandomColor(user.name) : getRandomColor(user?.email || 'default');


    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card>
                    <p>Loading profile...</p>
                </Card>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card>
                    <p>Please log in to view your profile.</p>
                </Card>
            </div>
        );
    }

    return (
        // Main container adjusted for full-page layout
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                </div>

                {/* Profile Card */}
                <Card className="p-8 shadow-lg rounded-lg">
                    <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
                        {/* Avatar Section */}
                        <div className="flex-shrink-0 mb-6 md:mb-0">
                            <div
                                className="w-32 h-32 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-md ring-4 ring-primary-300"
                                style={{ backgroundColor: avatarColor }}
                            >
                                {userInitials}
                            </div>
                        </div>

                        {/* User Details Section */}
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                {user.name || user.email.split('@')[0]}
                            </h2>
                            <p className="text-lg text-gray-600 mb-4">{user.email}</p>

                            <div className="space-y-3 text-base md:text-lg">
                                <div className="flex items-center justify-center md:justify-start">
                                    <span className="font-semibold text-gray-700 w-24">Role:</span>
                                    <span className="text-gray-800 capitalize flex-1">{user.role?.toLowerCase() || 'N/A'}</span>
                                </div>
                                {user.id && (
                                    <div className="flex items-center justify-center md:justify-start">
                                        <span className="font-semibold text-gray-700 w-24">User ID:</span>
                                        <span className="text-gray-800 flex-1">{user.id}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* You can add more cards here for other profile-related information, e.g., "Recent Activity", "Badges", etc. */}
            </div>
        </div>
    );
};

export default ProfilePage;
