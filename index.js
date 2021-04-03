'use strict';

/**
 * Common data for all prompts.
 * @typedef PromptInfo
 * @property {String} prompt - the text prompt to send to user
 * @property {TextChannel | DMChannel} channel - the channel to send the prompt to
 * @property {String} userId - the ID of the user to prompt
 * @property {Number} [time=Infinity] - the time in seconds to wait for the response, if 0 then wait forever
 * @property {Boolean} [cancelable=false] - if the prompt can be canceled
 */

/**
 * An option for a list reaction picker prompt.
 * @typedef PickerOption
 * @property {String} name - name of this option
 * @property {String} description - description for this option
 * @property {String} emojiName - the name of the emoji (only unicode emojis allowed!)
 */

module.exports = {
    ListPrompt: require('./prompts/list-prompts'),
    ChannelPrompt: require('./prompts/channel-prompt'),
    MemberPrompt: require('./prompts/member-prompt'),
    MessagePrompt: require('./prompts/message-prompt'),
    NumberPrompt: require('./prompts/number-prompt'),
    RolePrompt: require('./prompts/role-prompt'),
    SpecialPrompt: require('./prompts/special-prompt'),
    StringPrompt: require('./prompts/string-prompt'),
    RestrictedPrompt: require('./prompts/restricted-prompt'),
    TimeOutError: require('./errors').TimeOutError,
    CancelError: require('./errors').CancelError,
    TypeDefs: require('./typedefs'),
};