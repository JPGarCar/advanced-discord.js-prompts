const { MessageEmbed } = require('discord.js');
const { TimeOutError } = require('../errors');
const { channelMsgDelete, channelMsgWaitDelete } = require('../util/discord-util');
const NumberPrompt = require('./number-prompt');
const { PromptInfo, PickerOption } = require('../typedefs');
const { validatePromptInfo, createPrompt } = require('../util/prompt-util');

/**
 * Holds different list prompts.
 */
class ListPrompt {

    /**
     * Prompts the user with a lit of options. The user can react to the message to select an option.
     * This prompt works best with a low number of options (less than 5)!
     * @param {PromptInfo} promptInfo - cancelable is not used, users can't cancel this prompt!
     * @param {PickerOption[]} options 
     * @returns {Promise<PickerOption>}    
     * @throws {TimeOutError} if the user takes longer than the given time to choose the options.
     * @async
     */
    static async singleReactionPicker(promptInfo, options) {
        let optionList =  await ListPrompt.multiReactionPicker(promptInfo, options, 1);
        return optionList[0];
    }   

    /**
     * Prompts the user with a list of options. The user can react to the message to select options.
     * This prompt works best with a low number of options (less than 5)!
     * @param {PromptInfo} promptInfo - cancelable is not used, users can't cancel this prompt!
     * @param {PickerOption[]} options 
     * @param {Number} amount
     * @returns {Promise<PickerOption[]>}
     * @throws {TimeOutError} if the user takes longer than the given time to choose the options.
     * @async
     */
    static async multiReactionPicker(promptInfo, options, amount) {
        // users can not cancel this type of prompt
        promptInfo = validatePromptInfo(promptInfo);
        promptInfo.cancelable = false;
        promptInfo.prompt = `${promptInfo.prompt} \n* React to this message with the emoji to select that option! \n* You should select ${amount} option(s).`;

        const embed = new MessageEmbed()
            .setTitle(`Choose ${amount} option(s)!`)
            .setDescription(createPrompt(promptInfo));
        
        options.forEach((option, index, list) => embed.addField(`${option.emojiName} - ${option.name}`, option.description));
        
        const msg = await promptInfo.channel.send(`<@${promptInfo.userId}>`, { embed: embed });
        options.forEach((option, index, list) => msg.react(option.emojiName));

        try {
            const filter = (reaction, user) => !user.bot && user.id === promptInfo.userId && options.find((option) => option.emojiName === reaction.emoji.name);
            var emojiResponses = await msg.awaitReactions(filter, { max: amount, time: (promptInfo.time == Infinity ? null : promptInfo.time), errors: ['time'] });
        } catch (error) {
            if (error.name == 'time') {
                await channelMsgDelete(promptInfo.channel, promptInfo.userId, 'Time is up, please try again once you are ready.', 10);
                throw new TimeOutError();
            } else {
                throw error;
            }
        } finally {
            msg.delete();
        }

        return options.filter((option, index, list) => emojiResponses.find((reaction) => reaction.emoji.name === option.emojiName));
    }

    /**
     * Prompts the user with a list of options, the user will select one option by writing down the chosen option index.
     * @param {PromptInfo} promptInfo 
     * @param {*[]} list 
     * @returns {*} - the item the user chooses
     * @throws {TimeOutError} if the user takes longer than the given time to react
     * @throws {CancelError} if the user cancels the prompt.
     * @async
     */
    static async singleListChooser(promptInfo, list) {
        let returnList = await ListPrompt.multiListChooser(promptInfo, list, 1);
        return returnList[0];
    }

    /**
     * Prompts the user with a list of options, the user will select options by writing down the option's index.
     * @param {PromptInfo} promptInfo 
     * @param {*[]} list - the items in this list must have a valid toString() function
     * @param {Number} amount 
     * @return {Promise<*[]>} - list of items the user choose
     * @throws {TimeOutError} if the user takes longer than the given time to react
     * @throws {CancelError} if the user cancels the prompt.
     * @async
     */
    static async multiListChooser(promptInfo, list, amount) {
        promptInfo = validatePromptInfo(promptInfo);

        let text = '';
        list.forEach((value, index) => `\n${index} - ${value.toString()}`);

        const embed = new MessageEmbed()
            .setTitle(`Select ${amount} option(s)!`)
            .setDescription(`${promptInfo.prompt} ${text}`);
        let msg = await promptInfo.channel.send(`<@${promptInfo.userId}>`, { embed: embed });

        let finalList = [];

        try {
            while(finalList.length != amount) {
                let numbers = await NumberPrompt.multi({ 
                    prompt: 'Please write down the option numbers you would like to choose.', 
                    channel: promptInfo.channel, 
                    userId: promptInfo.userId,
                    time: promptInfo.time,
                    cancelable: promptInfo.cancelable,
                }, amount);
        
                finalList = list.filter((value, index, list) => numbers.includes(index));
                if (finalList.length != amount) {
                    await channelMsgWaitDelete(promptInfo.channel, promptInfo.userId, `You need to respond with ${amount} valid number(s).`);
                }
            }
        } finally {
            msg.delete();
        }
        return finalList;
    }
}
module.exports = ListPrompt;