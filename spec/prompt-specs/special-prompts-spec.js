const { Collection } = require("discord.js");
const { TimeOutError } = require("../../errors");
const MessagePrompt = require("../../prompts/message-prompt");
const SpecialPrompt = require("../../prompts/special-prompt");


describe('Special Prompts Specs', function() {

    let message2 = {
        delete: jasmine.createSpy('message delete'),
        /** @type {jasmine.Spy} */
        awaitReactions: null,
    };

    let channel = {
        type: 'text',
        send: jasmine.createSpy('channelSend').and.callFake(function() {
            return message2;
        }),
    };

    let promptInfo = {
        prompt: 'Prompt text!!!',
        userId: '0000',
        channel: channel,
    };

    describe('Reaction Prompt', function() {

        beforeEach(function() {
            message2.awaitReactions = jasmine.createSpy('await reactions');
            channel.send.calls.reset();
            message2.delete.calls.reset();
        });

        describe('single restricted emoji', function() {
            it('calls the single restricted reaction and returns emoji', async () => {
                let spy = spyOn(SpecialPrompt, 'singleRestrictedReaction').and.returnValue({ emoji: 'emoji' });
                let emoji = await SpecialPrompt.singleRestrictedEmoji(promptInfo, new Collection());
                expect(spy).toHaveBeenCalledOnceWith(promptInfo, new Collection());
                expect(emoji).toEqual('emoji');
            });
        });

        describe('single emoji', function() {
            it('calls single reaction and returns emoji', async () => {
                let spy = spyOn(SpecialPrompt, 'singleReaction').and.returnValue({ emoji: 'emoji' });
                let emoji = await SpecialPrompt.singleEmoji(promptInfo);
                expect(spy).toHaveBeenCalledOnceWith(promptInfo);
                expect(emoji).toEqual('emoji');
            });
        });

        describe('single', function() {
            it('calls multi reaction', async () => {
                let spy = spyOn(SpecialPrompt, 'multiReaction').and.returnValue(new Collection([['first', 1]]));
                let item = await SpecialPrompt.singleReaction(promptInfo);
                expect(spy).toHaveBeenCalledOnceWith(promptInfo, 1);
                expect(item).toEqual(1);
            });
        });

        describe('single restricted', function() {
            it('calls the single reaction function and returns correctly', async () => {
                let spy = spyOn(SpecialPrompt, 'singleReaction').and.returnValue({emoji: { name: 'emoji 1' } });
                let emoji = await SpecialPrompt.singleRestrictedReaction(promptInfo, new Collection([['emoji 2', 2]]));
                expect(spy).toHaveBeenCalledOnceWith(promptInfo);
                expect(emoji).toEqual({emoji: { name: 'emoji 1' } });
            });

            it('prompts again if emoji is already in use!', async () => {
                let counter = 0;
                let spy = spyOn(SpecialPrompt, 'singleReaction').and.callFake(() => {
                    if (counter === 0) {
                        counter++;
                        return {emoji: { name: 'emoji 1' } };
                    } else return {emoji: { name: 'emoji 2' } };
                });
                let emoji = await SpecialPrompt.singleRestrictedReaction(promptInfo, new Collection([['emoji 1', 2]]));
                expect(spy).toHaveBeenCalledTimes(2);
                expect(channel.send).toHaveBeenCalledTimes(1);
                expect(message2.delete).toHaveBeenCalledTimes(1);
                expect(emoji).toEqual({emoji: { name: 'emoji 2' } });
            });
        });

        describe('multi', function() {

            let reactionCollection = new Collection([
                ['first', { emoji: { name: '💩' } }], ['second', { emoji: { name: '🔪' } }]
            ]);

            it('sends the message, awaits reaction, then deletes the message', async () => {
                await SpecialPrompt.multiReaction(promptInfo, 2);
                expect(channel.send).toHaveBeenCalledTimes(1);
                expect(message2.awaitReactions).toHaveBeenCalledOnceWith(jasmine.any(Function), {
                    max: 2, time: null, errors: ['time']
                });
                expect(message2.delete).toHaveBeenCalledTimes(1);
            });

            it('works correctly with unlimited time', async () => {
                message2.awaitReactions.and.returnValue(reactionCollection);
                let reactions = await SpecialPrompt.multiReaction(promptInfo, 2);
                expect(reactions).toEqual(reactionCollection);
            });

            it('works correctly with limited time', async () => {
                promptInfo.time = 10;
                message2.awaitReactions.and.returnValue(reactionCollection);
                let reactions = await SpecialPrompt.multiReaction(promptInfo, 2);
                expect(reactions).toEqual(reactionCollection);
                expect(message2.awaitReactions).toHaveBeenCalledOnceWith(jasmine.any(Function), {
                    max: 2, time: 10 * 1000, errors: ['time']
                });
            });

            it('throws time out error when times run out', async () => {
                let error = new Error();
                error.name = 'time';
                message2.awaitReactions.and.throwError(error);

                await expectAsync(SpecialPrompt.multiReaction(promptInfo, 2)).toBeRejectedWithError(TimeOutError);
                expect(channel.send).toHaveBeenCalledTimes(2);
                expect(message2.delete).toHaveBeenCalledTimes(2);
            });

        });

    });

    describe('Boolean Prompt', function() {

        /** @type {jasmine.Spy} */
        let spy;

        beforeEach(function() {
            spy = spyOn(MessagePrompt, 'instructionPrompt');
        })

        it('calls instruction prompt with correct type', async () => {
            spy.and.returnValue({ cleanContent: 'yes' });
            await SpecialPrompt.boolean(promptInfo);
            expect(spy).toHaveBeenCalledOnceWith(promptInfo, MessagePrompt.InstructionType.BOOLEAN);
        });

        it('returns false with a no response', async () => {
            spy.and.returnValue({ cleanContent: 'nO' });
            let bool = await SpecialPrompt.boolean(promptInfo);
            expect(bool).toEqual(false);
        });

        it('returns true with a yes response', async () => {
            spy.and.returnValue({ cleanContent: 'yEs ' });
            let bool = await SpecialPrompt.boolean(promptInfo);
            expect(bool).toEqual(true);
        });

        it('prompts again if response is not yes or no', async () => {
            let counter = 0;
            spy.and.callFake(() => {
                if (counter === 0) {
                    counter++;
                    return { cleanContent: 'something' };
                }
                else return { cleanContent: 'yes' }
            });
            let bool = await SpecialPrompt.boolean(promptInfo);
            expect(spy).toHaveBeenCalledTimes(2);
            expect(bool).toEqual(true);
        });

    });

});