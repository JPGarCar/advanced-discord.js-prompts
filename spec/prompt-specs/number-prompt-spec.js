const MessagePrompt = require("../../prompts/message-prompt");
const NumberPrompt = require("../../prompts/number-prompt");

describe('Number Prompt Specs', function() {
    
    let message2 = {
        delete: jasmine.createSpy('message delete'),
    }

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

    describe('Multi', function() {

        /** @type {jasmine.Spy} */
        let spy;

        beforeEach(function() {
            spy = spyOn(MessagePrompt, 'instructionPrompt');
            channel.send.calls.reset();
        })

        it('calls instruction prompt correctly', async () => {
            spy.and.returnValue({ cleanContent: '1'});
            await NumberPrompt.multi(promptInfo);
            expect(spy).toHaveBeenCalledOnceWith(promptInfo, MessagePrompt.InstructionType.NUMBER, Infinity);
        });

        it('prompts again with the incorrect amount', async () => {
            let counter = 0;
            spy.and.callFake(() => {
                if (counter === 0) {
                    counter++;
                    return { cleanContent: '1' }
                } else {
                    return { cleanContent: '1 23'}
                }
            });

            await NumberPrompt.multi(promptInfo, 2);
            expect(spy).toHaveBeenCalledTimes(2);
            expect(channel.send).toHaveBeenCalledTimes(1);
        });

        it('prompts again with infinite amount and no number response', async () => {
            let counter = 0;
            spy.and.callFake(() => {
                if (counter === 0) {
                    counter++;
                    return { cleanContent: '' }
                } else {
                    return { cleanContent: '1 23'}
                }
            });

            await NumberPrompt.multi(promptInfo, 2);
            expect(spy).toHaveBeenCalledTimes(2);
            expect(channel.send).toHaveBeenCalledTimes(1);
        });

        it('returns the correct amount of numbers', async () => {
            spy.and.returnValue({ cleanContent: '1'});
            let numbers = await NumberPrompt.multi(promptInfo, 1);
            expect(spy).toHaveBeenCalledTimes(1);
            expect(numbers).toEqual([1]);
        });

        it('prompts again if prompt is invalid (text in it)', async () => {
            let counter = 0;
            spy.and.callFake(() => {
                if (counter === 0) {
                    counter++;
                    return { cleanContent: '1 asdf'}
                } else {
                    return { cleanContent: '1'}
                }
            });
            let numbers = await NumberPrompt.multi(promptInfo);
            expect(spy).toHaveBeenCalledTimes(2);
            expect(numbers).toEqual([1]);
        });

        it('prompts again with non infinite amount and invalid text', async () => {
            let counter = 0;
            spy.and.callFake(() => {
                if (counter === 0) {
                    counter++;
                    return { cleanContent: '1 asdf'}
                } else {
                    return { cleanContent: '1'}
                }
            });
            let numbers = await NumberPrompt.multi(promptInfo, 1);
            expect(spy).toHaveBeenCalledTimes(2);
            expect(numbers).toEqual([1]);
        });

        it('prompts again with non infinite amount and invalid text 2', async () => {
            let counter = 0;
            spy.and.callFake(() => {
                if (counter === 0) {
                    counter++;
                    return { cleanContent: '1 2 asdf'}
                } else {
                    return { cleanContent: '1'}
                }
            });
            let numbers = await NumberPrompt.multi(promptInfo, 1);
            expect(spy).toHaveBeenCalledTimes(2);
            expect(numbers).toEqual([1]);
        });

    });

    describe('Single', function() {
        it('calls multi with amount of 1', async () => {
            let spy = spyOn(NumberPrompt, 'multi').and.returnValue([1]);
            let number = await NumberPrompt.single(promptInfo);
            expect(spy).toHaveBeenCalledOnceWith(promptInfo, 1);
            expect(number).toEqual(1);
        })
    });

});