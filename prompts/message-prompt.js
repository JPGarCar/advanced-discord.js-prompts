const { Message } = require('discord.js');
const { TimeOutError, CancelError } = require('../errors');
const { channelMsgDelete } = require('../util/discord-util');
const { PromptInfo } = require('../typedefs');
const { validatePromptInfo, createPrompt } = require('../util/prompt-util');

/**
 * Holds different Discord Message prompts.
 */
class MessagePrompt {

    /**
     * Simple message prompt.
     * @param {PromptInfo} promptInfo - the common data, prompt, channel, userId
     * @returns {Promise<Message>} - the message response to the prompt or false if it timed out!
     * @throws {TimeOutError} if the user does not respond within the given time.
     * @throws {CancelError} if the user cancels the prompt.
     * @async
     */
    static async prompt(promptInfo) {
        let {prompt, channel, userId, time, cancelable} = validatePromptInfo(promptInfo);

        let promptMsg = await channel.send(createPrompt(prompt, channel, userId, time, cancelable));

        try {
            const filter = (message) => message.author.id === userId;
            var msgs = await channel.awaitMessages(filter, {max: 1, time: time == Infinity ? null : time * 1000, errors: ['time']});
        } catch (error) {
            if (error.name == 'time') {
                await channelMsgDelete(channel, userId, 'Time is up, please try again once you are ready, we recommend you write the message first, then react, then send the message.', 10);
                throw new TimeOutError();
            } else {
                throw error;
            }
        } finally {
            if (!promptMsg.deleted) await promptMsg.delete();
        }

        let msg = msgs.first();

        if (msg.channel.type != 'dm' && !msg.deleted) await msg.delete();

        if (cancelable && msg.content.toLowerCase().trim() === 'cancel') {
            throw new CancelError();
        }

        return msg;
    }

    /**
     * Message prompt with custom prompt message depending on responseType.
     * @param {PromptInfo} promptInfo 
     * @param {InstructionType} [instructionType] - the type of response, one of string, number, boolean, mention
     * @param {Number} [amount=Infinity]
     * @returns {Promise<Message>} - the message response to the prompt or false if it timed out!
     * @throws {TimeOutError} if the user does not respond within the given time.
     * @throws {CancelError} if the user cancels the prompt.
     * @async
     */
    static async instructionPrompt(promptInfo, instructionType, amount = Infinity) {
        promptInfo = validatePromptInfo(promptInfo);

        let instruction = '';

        switch(instructionType) {
            case MessagePrompt.InstructionType.NUMBER: 
                instruction = 'Respond with a number only!';
                break;
            case MessagePrompt.InstructionType.BOOLEAN: 
                instruction = 'Respond with "yes" or "no" only!';
                break;
            case MessagePrompt.InstructionType.MENTION: 
                instruction = 'To mention a user or a role use "@"! Ex: @Hacker or @John.'; 
                break;
            case MessagePrompt.InstructionType.CHANNEL: 
                instruction = 'To mention a channel use "#"! Ex: #banter.';
                break;
            default:
                instruction = 'Write your response!'
                break;
        }

        promptInfo.prompt = `${promptInfo.prompt} \n* ${instruction}`;
        if (amount != Infinity && instructionType != MessagePrompt.InstructionType.BOOLEAN) promptInfo.prompt = `${promptInfo.prompt} \n* Please respond with only ${amount}.`;
        return await MessagePrompt.prompt(promptInfo);
    }

    /**
     * The instruction types available for a prompt to explain.
     * @enum {Number}
     */
    static InstructionType = {
        NUMBER: 0,
        BOOLEAN: 1,
        MENTION: 2,
        CHANNEL: 3,
    }
}
module.exports = MessagePrompt;