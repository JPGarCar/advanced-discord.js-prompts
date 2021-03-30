
const { PromptInfo } = require('../../typedefs');
const MessagePrompt = require('../../prompts/message-prompt');
const { Collection } = require('discord.js');
const { CancelError } = require('../../errors');
const utils = require('../../util/prompt-util');

describe('Message Prompt Specs', function() {    

    let returnMessage = {
        content: 'this is the return message',
        delete: jasmine.createSpy('message return delete'),
        channel: { type: 'text' },
        deleted: false,
    }

    var message = {
        delete: jasmine.createSpy('messageDelete'),
        author: { id: '0000' },
    };

    var channel = {
        type: 'text',
        send: jasmine.createSpy('channelSend').and.callFake(function(text) {
            message.content = text;
            return message;
        }),
        awaitMessages: jasmine.createSpy('await messages').and.callFake(function(filter, options) {
            return new Collection([['first', returnMessage]]);
        }),
    };

    /** @type {PromptInfo} */
    let promptInfo;

    beforeEach(function() {
        promptInfo = {
            prompt: 'Prompt text!!!',
            userId: '0000',
            channel: channel,
        };
        message.delete.calls.reset();
        channel.send.calls.reset();
        channel.awaitMessages.calls.reset();
        returnMessage.delete.calls.reset();
    });

    describe('prompt static function', function() {
        // it('calls validatePromptInfo', async function() {
        //     let spy = spyOn(utils, 'validatePromptInfo');
        //     await MessagePrompt.prompt(promptInfo);
        //     expect(spy).toHaveBeenCalled();
        // });
    
        it('sends message to the channel', async function() {
            await MessagePrompt.prompt(promptInfo);
            expect(channel.send).toHaveBeenCalled();
        });
    
        it('awaits a message with the correct options', async function() {
            await MessagePrompt.prompt(promptInfo);
            expect(channel.awaitMessages).toHaveBeenCalledOnceWith(jasmine.any(Function), {
                max: 1,
                time: null,
                errors: ['time']
            });
        });
    
        it('awaits a message with the correct options 2', async function() {
            promptInfo.time = 10;
            await MessagePrompt.prompt(promptInfo);
            expect(channel.awaitMessages).toHaveBeenCalledOnceWith(jasmine.any(Function), {
                max: 1,
                time: 10 * 1000,
                errors: ['time']
            });
        });
    
        it('deletes the prompt message and user message', async function() {
            await MessagePrompt.prompt(promptInfo);
            expect(message.delete).toHaveBeenCalled();
            expect(returnMessage.delete).toHaveBeenCalled();
        });
    
        it('deletes the prompt message but not DM user message', async function() {
            returnMessage.channel.type = 'dm';
            await MessagePrompt.prompt(promptInfo);
            expect(message.delete).toHaveBeenCalled();
            expect(returnMessage.delete).not.toHaveBeenCalled();
        });
    
        it('returns the message', async function() {
            let msg = await MessagePrompt.prompt(promptInfo);
            expect(msg).toEqual(returnMessage);
        });
    
        it('throws a cancel error when message content is cancel', async function() {
            promptInfo.cancelable = true;
            returnMessage.content = 'cancel';
            await expectAsync(MessagePrompt.prompt(promptInfo)).toBeRejectedWithError(CancelError);
        });
    
        it('throws a cancel error with cancel in case', async function() {
            promptInfo.cancelable = true;
            returnMessage.content = 'CanCel';
            await expectAsync(MessagePrompt.prompt(promptInfo)).toBeRejectedWithError(CancelError);
        });
    });

    describe('instructionPrompt static function', function() {

        var promptSpy;

        beforeEach(function() {
            promptSpy = spyOn(MessagePrompt, 'prompt');
        });

        it('works with number', async () => {
            await MessagePrompt.instructionPrompt(promptInfo, MessagePrompt.InstructionType.NUMBER);
            expect(promptSpy).toHaveBeenCalledWith({
                prompt: `${promptInfo.prompt} \n* Respond with a number only!`,
                channel: promptInfo.channel,
                userId: promptInfo.userId,
                cancelable: false,
                time: Infinity,
            });
        });

        it('works with boolean', async function() {
            await MessagePrompt.instructionPrompt(promptInfo, MessagePrompt.InstructionType.BOOLEAN);
            expect(promptSpy).toHaveBeenCalledWith({
                prompt: `${promptInfo.prompt} \n* Respond with "yes" or "no" only!`,
                channel: promptInfo.channel,
                userId: promptInfo.userId,
                cancelable: false,
                time: Infinity,
            });
        });

        it('works with mention', async function() {
            await MessagePrompt.instructionPrompt(promptInfo, MessagePrompt.InstructionType.MENTION);
            expect(promptSpy).toHaveBeenCalledWith({
                prompt: `${promptInfo.prompt} \n* To mention a user or a role use "@"! Ex: @Hacker or @John.`,
                channel: promptInfo.channel,
                userId: promptInfo.userId,
                cancelable: false,
                time: Infinity,
            });
        });

        it('works with channel', async function() {
            await MessagePrompt.instructionPrompt(promptInfo, MessagePrompt.InstructionType.CHANNEL);
            expect(promptSpy).toHaveBeenCalledWith({
                prompt: `${promptInfo.prompt} \n* To mention a channel use "#"! Ex: #banter.`,
                channel: promptInfo.channel,
                userId: promptInfo.userId,
                cancelable: false,
                time: Infinity,
            });
        });

        it('works with channel and amount', async function() {
            await MessagePrompt.instructionPrompt(promptInfo, MessagePrompt.InstructionType.CHANNEL, 3);
            expect(promptSpy).toHaveBeenCalledWith({
                prompt: `${promptInfo.prompt} \n* To mention a channel use "#"! Ex: #banter. \n* Please respond with only 3.`,
                channel: promptInfo.channel,
                userId: promptInfo.userId,
                cancelable: false,
                time: Infinity,
            });
        });

        it('works with number and amount', async () => {
            await MessagePrompt.instructionPrompt(promptInfo, MessagePrompt.InstructionType.NUMBER, 3);
            expect(promptSpy).toHaveBeenCalledWith({
                prompt: `${promptInfo.prompt} \n* Respond with a number only! \n* Please respond with only 3.`,
                channel: promptInfo.channel,
                userId: promptInfo.userId,
                cancelable: false,
                time: Infinity,
            });
        });

        it('works with boolean and amount (no amount should show)', async function() {
            await MessagePrompt.instructionPrompt(promptInfo, MessagePrompt.InstructionType.BOOLEAN, 3);
            expect(promptSpy).toHaveBeenCalledWith({
                prompt: `${promptInfo.prompt} \n* Respond with "yes" or "no" only!`,
                channel: promptInfo.channel,
                userId: promptInfo.userId,
                cancelable: false,
                time: Infinity,
            });
        });
    });


});