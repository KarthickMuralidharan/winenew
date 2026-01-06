import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface CabinetGridProps {
    rows: number;
    columns: number;
    onPressCell?: (row: number, col: number) => void;
    bottlesMap?: Record<string, any>; // Key: "row-col" -> Bottle Data
}

export const CabinetGrid: React.FC<CabinetGridProps> = ({ rows, columns, onPressCell, bottlesMap = {} }) => {
    const theme = useTheme();

    const renderRow = (rowIndex: number) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
            {Array.from({ length: columns }).map((_, colIndex) => {
                const key = `${rowIndex}-${colIndex}`;
                const hasBottle = bottlesMap[key];

                return (
                    <TouchableOpacity
                        key={key}
                        style={[
                            styles.cell,
                            {
                                borderColor: theme.colors.outline,
                                backgroundColor: hasBottle ? theme.colors.primaryContainer : theme.colors.surface
                            }
                        ]}
                        onPress={() => onPressCell?.(rowIndex, colIndex)}
                    >
                        <Text style={styles.cellText}>{key}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    return (
        <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
            <ScrollView contentContainerStyle={styles.gridContainer}>
                {Array.from({ length: rows }).map((_, i) => renderRow(i))}
            </ScrollView>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    gridContainer: {
        padding: 10,
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        width: 60,
        height: 60,
        borderWidth: 1,
        margin: 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    cellText: {
        fontSize: 10,
        opacity: 0.5
    }
});
