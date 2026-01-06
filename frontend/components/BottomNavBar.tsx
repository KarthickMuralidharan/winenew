import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { useRouter, usePathname } from 'expo-router';

interface NavItem {
    label: string;
    icon: string;
    route: string;
    activeIcon?: string;
}

const NAV_ITEMS: NavItem[] = [
    {
        label: 'Home',
        icon: 'home-outline',
        activeIcon: 'home',
        route: '/dashboard'
    },
    {
        label: 'Cabinet',
        icon: 'view-grid-outline',
        activeIcon: 'view-grid',
        route: '/cabinet/demo-cabinet-1'
    },
    {
        label: 'Scan',
        icon: 'camera-outline',
        activeIcon: 'camera',
        route: '/scan'
    },
    {
        label: 'Stock',
        icon: 'chart-bar',
        activeIcon: 'chart-bar',
        route: '/stock'
    },
    {
        label: 'News',
        icon: 'newspaper-variant-outline',
        activeIcon: 'newspaper-variant',
        route: '/news'
    }
];

export const BottomNavBar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (route: string): boolean => {
        if (route === '/dashboard' && pathname === '/dashboard') return true;
        if (route === '/cabinet/demo-cabinet-1' && pathname.includes('/cabinet/')) return true;
        if (route === '/scan' && pathname === '/scan') return true;
        if (route === '/stock' && pathname === '/stock') return true;
        if (route === '/news' && pathname === '/news') return true;
        return false;
    };

    const handlePress = (route: string) => {
        router.push(route as any);
    };

    return (
        <View style={styles.container}>
            {NAV_ITEMS.map((item, index) => {
                const active = isActive(item.route);
                return (
                    <TouchableOpacity
                        key={index}
                        style={[styles.navItem, active && styles.navItemActive]}
                        onPress={() => handlePress(item.route)}
                    >
                        <Avatar.Icon
                            size={34}
                            icon={active ? (item.activeIcon || item.icon) : item.icon}
                            style={[styles.icon, active && styles.iconActive]}
                            color={active ? '#FFF' : '#8B4513'}
                        />
                        <Text style={[styles.label, active && styles.labelActive]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 1000,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        borderRadius: 16,
        gap: 2,
    },
    navItemActive: {
        backgroundColor: '#8B4513',
    },
    icon: {
        backgroundColor: 'transparent',
        margin: 0,
    },
    iconActive: {
        backgroundColor: '#8B4513',
    },
    label: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#8B4513',
    },
    labelActive: {
        color: '#FFF',
    },
});
