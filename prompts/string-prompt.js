const MessagePrompt = require('./message-prompt');
const { channelMsgWaitDelete } = require('../util/discord-util');
const { PromptInfo } = require('../typedefs');
const { validatePromptInfo } = require('../util/prompt-util');

/**
 * Holds different String prompts.
 */
class StringPrompt {
    /**
     * Prompts the user for a single string, can be as long as the user wants. Discord content will be toString()ed.
     * @param {PromptInfo} promptInfo
     * @returns {Promise<String>}
     * @throws {TimeOutError} if the user does not respond within the given time.
     * @throws {CancelError} if the user cancels the prompt.
     * @async
     */
    static async single(promptInfo) {
        let msg = await MessagePrompt.prompt(promptInfo);
        return msg.cleanContent;
    }

    /**
     * Prompts a user for one of a list of possible responses. Will re-prompt if given something different.
     * The response is case sensitive!
     * @param {PromptInfo} promptInfo 
     * @param {String[]} possibleResponses - list of responses to match the actual response or re-prompt
     * They must be single strings with no spaces.
     * @returns {Promise<String>}
     * @throws {TimeOutError} if the user does not respond within the given time.
     * @throws {CancelError} if the user cancels the prompt.
     * @async
     */
    static async restricted(promptInfo, possibleResponses) {
        let responseList = await StringPrompt.multiRestricted(promptInfo, possibleResponses, 1);
        return responseList[0];
    }

    /**
     * Prompts the user for one or more strings. The strings must be part of the possibleResponses.
     * @param {PromptInfo} promptInfo 
     * @param {String[]} possibleResponses - list of valid responses the user can respond with 
     * They must be single strings with no spaces.
     * @param {Number} amount - the amount of responses to expect
     * @return {Promise<String[]>}
     * @throws {TimeOutError} if the user does not respond within the given time.
     * @throws {CancelError} if the user cancels the prompt.
     * @async
     */
    static async multiRestricted(promptInfo, possibleResponses, amount) {
        let finalPrompt = `${promptInfo.prompt} \n* Your options are (case sensitive): ${possibleResponses.join(', ')}`;
        
        let response = await StringPrompt.single({prompt: finalPrompt, channel: promptInfo.channel, userId: promptInfo.userId});

        let responseList = response.split(' ');

        if(responseList.length != amount) {
            await channelMsgWaitDelete(promptInfo.channel, promptInfo.userId, `You have given ${responseList.length} but I expect only ${amount}. Try again!`);
            return await StringPrompt.multiRestricted(promptInfo, possibleResponses, amount);
        }

        let returnResponses = possibleResponses.filter(string => responseList.includes(string));

        if (returnResponses.length != amount) {
            await channelMsgWaitDelete(promptInfo.channel, promptInfo.userId, `Try again! You need to respond with ${amount} of the valid options!`);
            return await StringPrompt.multiRestricted(promptInfo, possibleResponses, amount);
        } else {
            return returnResponses;
        }
    }


}
module.exports = StringPrompt;