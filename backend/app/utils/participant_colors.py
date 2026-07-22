PARTICIPANT_COLORS = [
    "#EF4444",
    "#F97316",
    "#F59E0B",
    "#EAB308",
    "#84CC16",
    "#22C55E",
    "#10B981",
    "#14B8A6",
    "#06B6D4",
    "#0EA5E9",
    "#3B82F6",
    "#6366F1",
    "#8B5CF6",
    "#A855F7",
    "#D946EF",
    "#EC4899",
    "#F43F5E",
    "#78716C",
    "#64748B",
    "#475569",
]


def get_participant_color(user_id) -> str:
    """
    Deterministically assign a color to a participant.
    """

    hash_value = hash(str(user_id))

    return PARTICIPANT_COLORS[
        abs(hash_value) % len(PARTICIPANT_COLORS)
    ]