const { Collection } = require("discord.js");
const MemberPrompt = require("../../prompts/member-prompt");
const MessagePrompt = require("../../prompts/message-prompt");

describe('Member Prompt Specs', function() {

    let returnMessage;

    let message = {
        delete: jasmine.createSpy('messageDelete'),
        author: { id: '0000' },
    };

    let channel = {
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

    /** @type {jasmine.Spy} */
    let instructionSpy;

    beforeEach(function() {
        instructionSpy = spyOn(MessagePrompt, 'instructionPrompt').and.callFake(() => returnMessage);

        returnMessage = {
            content: 'this is the return message',
            delete: jasmine.createSpy('message return delete'),
            channel: { type: 'text' },
            deleted: false,
            mentions: {
                members: new Collection([['item 1', 1]]),
                channels: new Collection(),
            },
        };

        promptInfo = {
            prompt: 'Prompt text!!!',
            userId: '0000',
            channel: channel,
        };
        message.delete.calls.reset();
        channel.send.calls.reset();
        channel.awaitMessages.calls.reset();
        returnMessage.delete.calls.reset();

        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    describe('multi function', () => {

        it('calls instruction prompt with mention and amount', async () => {
            await MemberPrompt.multi(promptInfo);
            expect(instructionSpy).toHaveBeenCalledWith(promptInfo, MessagePrompt.InstructionType.MENTION, Infinity);
        });

        it('prompts again if size is not equal to amount', async () => {
            MemberPrompt.multi(promptInfo, 2);
            await new Promise((resolve) => setTimeout(resolve, 5100));
            returnMessage.mentions.members = new Collection([['item 1', 1], ['item 2', 2]]);
            expect(instructionSpy.calls.count()).toBeGreaterThanOrEqual(2);
        });

        it('prompts again if infinity amount and no members mentioned', async () => {
            returnMessage.mentions.members = new Collection();
            MemberPrompt.multi(promptInfo);
            await new Promise((resolve) => setTimeout(resolve, 5100));
            returnMessage.mentions.members = new Collection([['item 1', 1], ['item 2', 2]]);
            expect(instructionSpy.calls.count()).toBeGreaterThanOrEqual(2);
        });

        it('works as expected with ideal params', async () => {
            let members = await MemberPrompt.multi(promptInfo);
            expect(members).toEqual(returnMessage.mentions.members);
        });

    });

    describe('single function', () => {

        it('calls the multi function', async () => {
            let multiSpy = spyOn(MemberPrompt, 'multi').and.callFake(() => returnMessage.mentions.members);
            await MemberPrompt.single(promptInfo);
            expect(multiSpy).toHaveBeenCalledWith(promptInfo, 1);
        });

        it('returns only one member', async () => {
            let member = await MemberPrompt.single(promptInfo);
            expect(member).toEqual(1);
        });

    });

});