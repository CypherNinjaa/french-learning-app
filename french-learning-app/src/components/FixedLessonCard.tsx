
// Fixed LessonCard component to ensure proper clickability
const LessonCard = ({ lesson, onPress, index }) => {
    return (
        <TouchableOpacity
            style={styles.lessonCard}
            onPress={() => onPress(lesson)}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel={`Open lesson ${lesson.title}`}
        >
            <View style={styles.lessonCardContent}>
                <View style={styles.lessonNumber}>
                    <Text style={styles.lessonNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonDescription} numberOfLines={2}>
                        {lesson.content?.introduction || 'Start learning now'}
                    </Text>
                    <View style={styles.lessonMeta}>
                        <Text style={styles.metaText}>
                            {lesson.estimated_duration || 15} min
                        </Text>
                        <Text style={styles.metaText}>
                            {lesson.difficulty_level || 'beginner'}
                        </Text>
                    </View>
                </View>
                <View style={styles.lessonArrow}>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

// Styles to ensure proper touch targets
const styles = StyleSheet.create({
    lessonCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        minHeight: 80, // Ensure minimum touch target size
    },
    lessonCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    lessonNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    lessonNumberText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    lessonInfo: {
        flex: 1,
    },
    lessonTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    lessonDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    lessonMeta: {
        flexDirection: 'row',
        gap: 16,
    },
    metaText: {
        fontSize: 12,
        color: '#999',
    },
    lessonArrow: {
        marginLeft: 8,
    },
});
