import orderedEmoji from "unicode-emoji-json/data-ordered-emoji.json";

export const supportedReactionEmojis = orderedEmoji as readonly string[];

const supportedReactionEmojiSet = new Set(supportedReactionEmojis);

export type ReactionEmoji = (typeof supportedReactionEmojis)[number];

export function isReactionEmoji(value: string): value is ReactionEmoji {
    return supportedReactionEmojiSet.has(value);
}

export function assertReactionEmoji(value: string): asserts value is ReactionEmoji {
    if (!isReactionEmoji(value)) {
        throw new TypeError(`Unsupported reaction emoji: ${value}`);
    }
}
