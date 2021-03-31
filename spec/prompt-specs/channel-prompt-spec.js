const { Collection } = require("discord.js");
const ChannelPrompt = require("../../prompts/channel-prompt");
const MessagePrompt = require("../../prompts/message-prompt");

describe('Channel Prompt Specs', function() {

    let returnMessage;

    let channel = {
        type: 'text',
        send: jasmine.createSpy('channelSend').and.callFake(function() {
            return {
                delete: jasmine.createSpy('message delete'),
            };
        }),
    };

    /** @type {PromptInfo} */
    let promptInfo;

    beforeEach(function() {
        returnMessage = {
            content: 'this is the return message for channel',
            delete: jasmine.createSpy('message return delete'),
            channel: { type: 'text' },
            deleted: false,
            mentions: {
                channels: new Collection([['item 1', 1]]),
            },
        };

        promptInfo = {
            prompt: 'Prompt text!!!',
            userId: '0000',
            channel: channel,
        };

        returnMessage.delete.calls.reset();

        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    describe('multi functions', function() {

            /** @type {jasmine.Spy} */
            let instructionSpy;

        beforeEach(function() {
            let counter = 0;
            instructionSpy = spyOn(MessagePrompt, 'instructionPrompt').and.callFake(() => {
                if (counter === 0) {
                    counter++;
                    return returnMessage;
                } else {
                    returnMessage.mentions.channels = new Collection([['item 1', 1], ['item 2', 2]]);
                    return returnMessage;
                }
            });
        })

        it('calls instruction prompt with mention and amount', async () => {
            await ChannelPrompt.multi(promptInfo);
            expect(instructionSpy).toHaveBeenCalledWith(promptInfo, MessagePrompt.InstructionType.CHANNEL, Infinity);
        });

        it('prompts again if size is not equal to amount', async () => {
            await ChannelPrompt.multi(promptInfo, 2);            
            expect(instructionSpy).toHaveBeenCalledTimes(2);
        });

        it('prompts again if infinity amount and no members mentioned', async () => {
            returnMessage.mentions.channels = new Collection();
            await ChannelPrompt.multi(promptInfo);
            expect(instructionSpy).toHaveBeenCalledTimes(2);
        });

        it('works as expected with ideal params', async () => {
            let channels = await ChannelPrompt.multi(promptInfo);
            expect(channels).toEqual(returnMessage.mentions.channels);
        });

    });

    describe('single functions', function() {
        
        /** @type {jasmine.Spy} */
        let multiSpy;

        beforeEach(function() {
            multiSpy = spyOn(ChannelPrompt, 'multi').and.callFake(() => returnMessage.mentions.channels);
        });

        it('calls the multi function', async () => {
            await ChannelPrompt.single(promptInfo);
            expect(multiSpy).toHaveBeenCalledWith(promptInfo, 1);
        });

        it('returns only one member', async () => {
            let channel = await ChannelPrompt.single(promptInfo);
            expect(channel).toEqual(1);
        });

    });

});