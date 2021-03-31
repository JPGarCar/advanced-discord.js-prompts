const MessagePrompt = require("../../prompts/message-prompt");
const StringPrompt = require("../../prompts/string-prompt");

describe('String Prompt Specs', function() {

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

    describe('single', function() {
        it('calls the message prompt and returns cleanContent', async () => {
            let spy = spyOn(MessagePrompt, 'prompt').and.returnValue({ cleanContent: 'This is a clean content' });
            let string = await StringPrompt.single(promptInfo);

            expect(spy).toHaveBeenCalledOnceWith(promptInfo);
            expect(string).toEqual('This is a clean content');
        });
    });

    describe('multi restricted', function() {

        it('calls string single prompt', async () => {
            let spy = spyOn(StringPrompt, 'single').and.returnValue('option-1');

            let response = await StringPrompt.multiRestricted(promptInfo, ['option-1', 'option-2'], 1);
            expect(spy).toHaveBeenCalledTimes(1);
            expect(response).toEqual(['option-1']);
        });

        it('prompts again if response not in options', async () => {
            let count = 0;
            let spy = spyOn(StringPrompt, 'single').and.callFake(() => {
                if (count === 0) {
                    count++;
                    return 'not-an-option';
                } else {
                    return 'option-2';
                }
            });

            let response = await StringPrompt.multiRestricted(promptInfo, ['option-1', 'option-2'], 1);
            expect(spy).toHaveBeenCalledTimes(2);
            expect(response).toEqual(['option-2']);
        });

        it('returns the correct list of strings', async () => {
            let spy = spyOn(StringPrompt, 'single').and.returnValue('option-2 option-3');

            let response = await StringPrompt.multiRestricted(promptInfo, ['option-1', 'option-2', 'option-3'], 2);
            expect(spy).toHaveBeenCalledTimes(1);
            expect(response).toEqual(['option-2', 'option-3']);
        });

    });

    describe('restricted', function() {
        it('calls the multi restricted function', async () => {
            let spy = spyOn(StringPrompt, 'multiRestricted').and.returnValue(['option-2']);

            let response = await StringPrompt.restricted(promptInfo, ['option-1', 'option-2']);
            expect(spy).toHaveBeenCalledOnceWith(promptInfo, ['option-1', 'option-2'], 1);
            expect(response).toEqual('option-2');
        });
    });

});