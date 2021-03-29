const { PromptInfo } = require('../typedefs');

/**
 * Creates the prompt out of the promptInfo data.
 * @param {PromptInfo} promptInfo 
 * @returns {Promise<String>}
 */
async function createPrompt({prompt, channel, userId, time = Infinity, cancelable = true}) {
    let finalPrompt = `<@${userId}> ${prompt}`;
    if (time != Infinity) finalPrompt = `${finalPrompt} \n* Respond within ${time} seconds.`;
    finalPrompt = `${finalPrompt} \n* ${cancelable ? 'Write "cancel" to cancel the prompt' : 'You can not cancel this prompt'}.`;

    return finalPrompt;
}
module.exports.createPrompt = createPrompt;

/**
 * Validates the prompt info and returns the validated object.
 * @param {PromptInfo} promptInfo 
 * @returns {PromptInfo}
 * @throws Errors if the information is not valid!
 */
function validatePromptInfo(promptInfo) {
    if (!promptInfo?.prompt) throw new Error('You must give a prompt the prompt string!');
    if (!promptInfo?.channel) throw new Error('You must give a prompt the channel to send the prompt on!');
    if (promptInfo.channel.type != 'text' || promptInfo.channel.type != 'dm') throw new Error('The prompt channel must be a text or DM channel!');
    if (!promptInfo?.userId) throw new Error('You must give a prompt the user id to tag the user who must respond.');
    if (!promptInfo?.time) promptInfo.time = Infinity;
    if (!promptInfo?.cancelable) promptInfo.cancelable = false;
    return promptInfo;
}
module.exports.validatePromptInfo = validatePromptInfo;