import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Text } from 'react-native';
import { Avatar, Chip } from 'react-native-paper';

interface Bottle {
    id: string;
    details: {
        name: string;
        type: 'Red' | 'White' | 'Rose' | 'Sparkling' | 'Dessert' | 'Other';
        vintage?: string;
        winery?: string;
    };
    location: { row: number; col: number; depthIndex: number };
}

interface ShelfRackGridProps {
    rows: number;
    columns: number;
    bottles: Bottle[];
    onCellPress?: (row: number, col: number, bottle?: Bottle) => void;
    showLabels?: boolean;
}

// Color configuration for each wine type
const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    'Red': { bg: '#8B4513', border: '#6B3410', text: '#FFF' },
    'White': { bg: '#F5DEB3', border: '#D2B48C', text: '#8B4513' },
    'Rose': { bg: '#FF69B4', border: '#CD5C5C', text: '#FFF' },
    'Sparkling': { bg: '#FFD700', border: '#FFA500', text: '#8B4513' },
    'Dessert': { bg: '#9370DB', border: '#6A5ACD', text: '#FFF' },
    'Other': { bg: '#808080', border: '#696969', text: '#FFF' }
};

// Row background colors (alternating for visual distinction)
const ROW_COLORS = [
    '#FFF8F0', // Cream
    '#FFF5E6', // Light cream
    '#FFF0E6', // Peach
    '#F5F5F5', // Light gray
    '#F0F8FF', // Alice blue
];

export const ShelfRackGrid: React.FC<ShelfRackGridProps> = ({
    rows,
    columns,
    bottles,
    onCellPress,
    showLabels = true
}) => {
    // Create bottle map for quick lookup
    const bottleMap: Record<string, Bottle> = {};
    bottles.forEach(bottle => {
        const key = `${bottle.location.row}-${bottle.location.col}`;
        bottleMap[key] = bottle;
    });

    const getBottleColor = (type: string) => {
        return TYPE_COLORS[type] || TYPE_COLORS['Other'];
    };

    const renderBottleCell = (row: number, col: number) => {
        const key = `${row}-${col}`;
        const bottle = bottleMap[key];
        const colors = bottle ? getBottleColor(bottle.details.type) : null;

        return (
            <TouchableOpacity
                key={key}
                style={[
                    styles.cell,
                    bottle && styles.cellWithBottle,
                    colors && { backgroundColor: colors.bg, borderColor: colors.border }
                ]}
                onPress={() => onCellPress?.(row, col, bottle)}
            >
                {bottle ? (
                    <View style={styles.bottleContent}>
                        <Avatar.Icon
                            size={24}
                            icon="bottle-wine"
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                            color={colors?.text || '#FFF'}
                        />
                        {showLabels && bottle.details.vintage && (
                            <Text style={[styles.vintageText, { color: colors?.text || '#FFF' }]}>
                                {bottle.details.vintage}
                            </Text>
                        )}
                    </View>
                ) : (
                    <View style={styles.emptyCell}>
                        <Text style={styles.locationText}>{row},{col}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <ScrollView
            horizontal
            contentContainerStyle={styles.horizontalScroll}
            showsHorizontalScrollIndicator={false}
        >
            <ScrollView
                contentContainerStyle={styles.verticalScroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.gridContainer}>
                    {/* Column headers */}
                    <View style={styles.headerRow}>
                        <View style={styles.cornerCell} />
                        {Array.from({ length: columns }).map((_, col) => (
                            <View key={`header-${col}`} style={styles.headerCell}>
                                <Text style={styles.headerText}>{String.fromCharCode(65 + col)}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Rows */}
                    {Array.from({ length: rows }).map((_, rowIndex) => {
                        const actualRow = rowIndex + 1;
                        const rowColor = ROW_COLORS[actualRow % ROW_COLORS.length];

                        return (
                            <View key={`row-${actualRow}`} style={styles.rowContainer}>
                                {/* Row header */}
                                <View style={[styles.rowHeader, { backgroundColor: rowColor }]}>
                                    <Text style={styles.rowHeaderText}>{actualRow}</Text>
                                </View>

                                {/* Cells in this row */}
                                {Array.from({ length: columns }).map((_, colIndex) => {
                                    const actualCol = colIndex + 1;
                                    return (
                                        <View
                                            key={`cell-${actualRow}-${actualCol}`}
                                            style={[styles.cellWrapper, { backgroundColor: rowColor }]}
                                        >
                                            {renderBottleCell(actualRow, actualCol)}
                                        </View>
                                    );
                                })}
                            </View>
                        );
                    })}
                </View>

                {/* Legend */}
                <View style={styles.legend}>
                    <Text style={styles.legendTitle}>Wine Types</Text>
                    <View style={styles.legendItems}>
                        {Object.entries(TYPE_COLORS).map(([type, colors]) => (
                            <View key={type} style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: colors.bg, borderColor: colors.border }]} />
                                <Text style={styles.legendText}>{type}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    horizontalScroll: {
        flexGrow: 1,
    },
    verticalScroll: {
        flexGrow: 1,
        padding: 16,
    },
    gridContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    cornerCell: {
        width: 40,
        height: 30,
    },
    headerCell: {
        width: 60,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#8B4513',
        borderRadius: 12,
        marginHorizontal: 2,
    },
    headerText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    rowContainer: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    rowHeader: {
        width: 40,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        marginRight: 4,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    rowHeaderText: {
        fontWeight: 'bold',
        color: '#8B4513',
        fontSize: 14,
    },
    cellWrapper: {
        marginHorizontal: 2,
        borderRadius: 12,
        padding: 1,
    },
    cell: {
        width: 60,
        height: 60,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#DDD',
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    cellWithBottle: {
        borderWidth: 2,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    emptyCell: {
        opacity: 0.3,
    },
    bottleContent: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: 2,
    },
    vintageText: {
        fontSize: 9,
        fontWeight: 'bold',
        marginTop: 2,
        textAlign: 'center',
    },
    locationText: {
        fontSize: 8,
        color: '#999',
    },
    legend: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#FFF',
        borderRadius: 16,
        elevation: 2,
    },
    legendTitle: {
        fontWeight: 'bold',
        color: '#8B4513',
        marginBottom: 8,
        fontSize: 14,
    },
    legendItems: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    legendText: {
        fontSize: 11,
        color: '#666',
    },
});
