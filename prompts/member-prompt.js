const { Collection, GuildMember } = require('discord.js');
const MessagePrompt = require('./message-prompt');
const { channelMsgWaitDelete } = require('./util/discord-util');
const { PromptInfo } = require('../typedefs');

/**
 * Holds different Guild Member prompts.
 */
class MemberPrompt {

    /**
     * Prompts the user for a single member mention.
     * @param {PromptInfo} promptInfo
     * @returns {Promise<GuildMember>}
     * @throws {TimeOutError} if the user does not respond within the given time.
     * @throws {CancelError} if the user cancels the prompt.
     * @async
     */
    static async single(promptInfo) {
        let members = await MemberPrompt.multi(promptInfo, 1);
        return members.first();
    }

    /**
     * Prompts the user for multiple members, can set exact amount.
     * Will re-prompt if amount is not equal to given amount.
     * @param {PromptInfo} promptInfo 
     * @param {Number} [amount=Infinity] - amount of members to prompt for
     * @returns {Promise<Collection<String, GuildMember>>}
     * @throws {TimeOutError} if the user does not respond within the given time.
     * @throws {CancelError} if the user cancels the prompt.
     * @async
     */
    static async multi(promptInfo, amount = Infinity) {
        if (amount != Infinity) promptInfo.prompt = `${promptInfo.prompt} \n* Please mention only ${amount} members.`;
        let msg = await MessagePrompt.instructionPrompt(promptInfo, MessagePrompt.InstructionType.MENTION);

        let members = msg.mentions.members;
        if (amount != Infinity && members.size != amount) {
            await channelMsgWaitDelete(promptInfo.channel, promptInfo.userId, `You should only mention ${amount} members! Try again!`);
            return await MemberPrompt.multi(promptInfo, amount);
        } else if (members.size === 0) {
            await channelMsgWaitDelete(promptInfo.channel, promptInfo.userId, 'You need to mention members with "@"! Try again!');
            return await MemberPrompt.multi(promptInfo, amount);
        } else {
            return members;
        }
    }

}
module.exports = MemberPrompt;