import type { TextChannel, DMChannel, Collection, GuildMember, Message, Role, GuildEmoji, ReactionEmoji, MessageReaction, EmojiIdentifierResolvable } from "discord.js";

declare module 'advanced-discord.js-prompts' {
    export interface PromptInfo {
        prompt: string;
        channel: TextChannel | DMChannel;
        userId: string;
        time: number;
        cancelable: boolean;
    }

    export interface PickerOption {
        name: string;
        description: string;
        emojiName: string;
    }

    export class ChannelPrompt {
        public static single(promptInfo: PromptInfo): Promise<TextChannel>;
        public static multi(promptInfo: PromptInfo, amount: number): Promise<Collection<string, TextChannel>>;
    }

    export class ListPrompt {
        public static singleReactionPicker(promptInfo: PromptInfo, options: PickerOption[]): Promise<PickerOption>;
        public static multiReactionPicker(promptInfo: PromptInfo, options: PickerOption[], amount: number): Promise<PickerOption>;
        public static singleListChooser(promptInfo: PromptInfo, list: any[]): Promise<any>;
        public static multiListChooser(promptInfo: PromptInfo, list: any[], amount: number): Promise<any>;
    }

    export class MemberPrompt {
        public static single(promptInfo: PromptInfo): Promise<GuildMember>;
        public static multi(promptInfo: PromptInfo, amount: number): Promise<Collection<string, GuildMember>>;
    }

    export class MessagePrompt {
        public static InstructionType: 0 | 1 | 2 | 3;
        public static prompt(promptInfo: PromptInfo): Promise<Message>;
        public static instructionPrompt(promptInfo: PromptInfo, instructionType: number, amount: number): Promise<Message>;
    }

    export class NumberPrompt {
        public static single(promptInfo: PromptInfo): Promise<Number>;
        public static multi(promptInfo: PromptInfo, amount: number): Promise<Number[]>;
    }

    export class RestrictedPrompt {
        public static single(promptFunction: Function, promptInfo: PromptInfo, unavailableList: TextChannel[] | Role[] | GuildMember[]): Promise<TextChannel | Role | GuildMember>;
    }

    export class RolePrompt {
        public static single(promptInfo: PromptInfo): Promise<Role>;
        public static multi(promptInfo: PromptInfo, amount: number): Promise<Collection<string, Role>>;
    }

    export class SpecialPrompt {
        public static singleEmoji(promptInfo: PromptInfo): Promise<GuildEmoji | ReactionEmoji>;
        public static singleRestrictedEmoji(promptInfo: PromptInfo, unavailableEmojis: Collection<string, EmojiIdentifierResolvable>): Promise<GuildEmoji | ReactionEmoji>;
        public static singleReaction(promptInfo: PromptInfo): Promise<MessageReaction>;
        public static singleRestrictedReaction(promptInfo: PromptInfo, unavailableEmojis: Collection<string, any>): Promise<MessageReaction>;
        public static mulitReaction(promptInfo: PromptInfo, amount: number): Promise<Collection<string, MessageReaction>>;
        public static boolean(promptInfo: PromptInfo): Promise<boolean>;
    }

    export class StringPrompt {
        public static single(promptInfo: PromptInfo): Promise<string>;
        public static restricted(promptInfo: PromptInfo, possibleResponses: string[]): Promise<string>;
        public static multiRestricdted(promptInfo: PromptInfo, possibleResponses: string[]): Promise<string[]>;
    }

}