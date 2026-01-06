import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { Cabinet } from '../types';

interface RoomVisualizerProps {
    racks: Cabinet[];
    onPressRack: (rack: Cabinet) => void;
    isEditing?: boolean;
    onUpdatePosition?: (rack: Cabinet, x: number, y: number) => void;
}

// Draggable Rack Component
const DraggableRack = ({ rack, isEditing, onPress, onMove }: {
    rack: Cabinet,
    isEditing?: boolean,
    onPress: () => void,
    onMove?: (x: number, y: number) => void
}) => {
    const theme = useTheme();
    // Default to 10,10 if missing to allow dragging into view
    const initialX = rack.roomLayout?.x || 10;
    const initialY = rack.roomLayout?.y || 10;

    // Use a ref to track current value synchronously for the release callback
    const valStore = useRef({ x: initialX, y: initialY });
    const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;

    useEffect(() => {
        const id = pan.addListener((value) => {
            valStore.current = value;
        });
        return () => pan.removeListener(id);
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => !!isEditing,
            onPanResponderGrant: () => {
                pan.setOffset({
                    x: valStore.current.x,
                    y: valStore.current.y
                });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                pan.flattenOffset();
                if (onMove) {
                    // Now we can safely use the listener-updated ref
                    onMove(valStore.current.x, valStore.current.y);
                }
            }
        })
    ).current;

    return (
        <Animated.View
            style={{
                transform: [{ translateX: pan.x }, { translateY: pan.y }],
                position: 'absolute',
                left: 0,
                top: 0,
                zIndex: isEditing ? 100 : 1
            }}
            {...panResponder.panHandlers}
        >
            <TouchableOpacity
                onPress={onPress}
                disabled={!!isEditing}
                style={[
                    styles.rack,
                    {
                        backgroundColor: isEditing ? theme.colors?.tertiaryContainer || '#ccc' : theme.colors.primaryContainer,
                        width: rack.roomLayout?.width || 60,
                        height: rack.roomLayout?.height || 50,
                    }
                ]}
            >
                <Text style={{ fontSize: 10, textAlign: 'center' }}>{rack.name}</Text>
                {isEditing && <IconButton icon="drag" size={12} />}
            </TouchableOpacity>
        </Animated.View>
    );
};

export const RoomVisualizer: React.FC<RoomVisualizerProps> = ({ racks, onPressRack, isEditing, onUpdatePosition }) => {
    const theme = useTheme();

    return (
        <View style={[styles.roomContainer, { borderColor: theme.colors.outline }]}>
            <Text style={styles.label}>Room View (Top Down) {isEditing && "- Drag Racks to Move"}</Text>
            {racks.map((rack) => (
                <DraggableRack
                    key={rack.id}
                    rack={rack}
                    isEditing={isEditing}
                    onPress={() => onPressRack(rack)}
                    onMove={(x, y) => onUpdatePosition?.(rack, x, y)}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    roomContainer: {
        flex: 1,
        minHeight: 400,
        borderWidth: 2,
        margin: 10,
        position: 'relative',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden'
    },
    label: { position: 'absolute', top: 5, left: 5, color: '#ccc', zIndex: 0 },
    rack: {
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12
    }
});
