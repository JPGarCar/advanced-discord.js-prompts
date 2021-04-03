const { GuildMember, Role, TextChannel } = require('discord.js');
const { PromptInfo } = require('../typedefs');
const { channelMsgWaitDelete } = require('../util/discord-util');
const ChannelPrompt = require('./channel-prompt');
const MemberPrompt = require('./member-prompt');
const RolePrompt = require('./role-prompt');

/**
 * The RestrictedPrompt class allows users to add the restricted feature to any prompt.
 * This is useful for when developers want the response not to be something, and would 
 * like the bot to re-prompt until we get a clean response.
 */
class RestrictedPrompt {

    /**
     * Re-prompt the user until their response is not part of the unavailableList.
     * Will add the unavailable options to the prompt.
     * @param {ChannelPrompt.single | RolePrompt.single | MemberPrompt.single} promptFunction 
     * @param {PromptInfo} promptInfo 
     * @param {TextChannel[] | Role[] | GuildMember[]} unavailableList - list the response can not be
     * @returns {Promise<TextChannel | Role | GuildMember>}
     * @throws Error if the list item type does not match the return item from the prompt function.
     * @throws {TimeOutError} if the user does not respond within the given time.
     * @throws {CancelError} if the user cancels the prompt.
     * @async
     */
    static async single(promptFunction, promptInfo, unavailableList) {
        let response = await promptFunction({
            prompt: `${promptInfo.prompt} \n Unavailable responses: ${unavailableList.join(', ')}`,
            channel: promptInfo.channel,
            userId: promptInfo.userId,
            time: promptInfo.time,
            cancelable: promptInfo.cancelable,
        });

        // throw error if list items do not match response item
        if (response.constructor.name != unavailableList[0].constructor.name) throw new Error('List and response items do not match!');

        if (unavailableList.includes(response)) {
            await channelMsgWaitDelete(promptInfo.channel, promptInfo.userId, 'The response is not valid please try again!');
            return await RestrictedPrompt.single(promptFunction, promptInfo, unavailableList);
        } else {
            return response;
        }
    }

}
module.exports = RestrictedPrompt;