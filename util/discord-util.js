const { Message, TextChannel } = require('discord.js');

/**
 * Utility functions to do common Discord tasks.
 * @module DiscordUtils
 */

/**
 * Sends a message to a user via a channel, waits for some time, then deletes the message.
 * @param {TextChannel} channel 
 * @param {String} userId 
 * @param {String} msgText 
 * @param {Number} [waitTime=3] - amount of time to wait in seconds
 */
async function channelMsgWaitDelete(channel, userId, msgText, waitTime = 3) {
    let msg = await channelMsg(channel, userId, msgText);
    await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
    await msg.delete();
}
module.exports.channelMsgWaitDelete = channelMsgWaitDelete;

/**
 * Sends a message to a user via a channel. The user is mentioned.
 * @param {TextChannel} channel 
 * @param {String} userId 
 * @param {String} msgText 
 * @returns {Promise<Message>}
 */
async function channelMsg(channel, userId, msgText) {
    return await channel.send(`<@${userId}> ${msgText}`);
}
module.exports.channelMsg = channelMsg;

/**
 * Sends a message to a user via a channel. Message is removed after a time out.
 * @param {TextChannel} channel 
 * @param {String} userId 
 * @param {String} msgText 
 * @param {Number} time - time to wait to delete message, in seconds
 */
async function channelMsgDelete(channel, userId, msgText, time) {
    let msg = await channelMsg(channel, userId, msgText);
    msg.delete({timeout: time * 1000});
}
module.exports.channelMsgDelete = channelMsgDelete;