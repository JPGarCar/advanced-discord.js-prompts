const { PromptInfo } = require('../../typedefs');
const { createPrompt, validatePromptInfo } = require('../../util/prompt-util');

describe('Prompt Util Specs', function() {
    /** @type {PromptInfo} */
    let promptInfo1 = {
        prompt: 'Prompt Text.',
        channel: { type: 'text' },
        userId: '0000',
        time: 10,
        cancelable: true,
    };

    /** @type {PromptInfo} */
    let promptInfo2 = {
        prompt: 'Prompt Text 2.',
        channel: { type: 'text' },
        userId: '0000',
        time: Infinity,
        cancelable: false,
    };

    /** @type {PromptInfo} */
    let promptInfo3 = {
        prompt: 'Prompt Text 3.',
        channel: { type: 'dm' },
        userId: '0000',
        time: Infinity,
        cancelable: true,
    };

    it('Create the prompt 1', function() {
        let prompt = createPrompt(promptInfo1);

        expect(prompt)
        .toBe(`<@${promptInfo1.userId}> ${promptInfo1.prompt} \n* Respond within ${promptInfo1.time} seconds. \n* Write "cancel" to cancel the prompt.`);
    });

    it('Create the prompt 2', function() {
        let prompt = createPrompt(promptInfo2);

        expect(prompt)
        .toBe(`<@${promptInfo2.userId}> ${promptInfo2.prompt} \n* You can not cancel this prompt.`)
    });

    it('Create the prompt 3', function() {
        let prompt = createPrompt(promptInfo3);

        expect(prompt)
        .toBe(`<@${promptInfo3.userId}> ${promptInfo3.prompt} \n* Write "cancel" to cancel the prompt.`)
    });

    it ('validate prompt 1 2 3', function() {
        expect(() => validatePromptInfo(promptInfo1)).not.toThrowError();
        expect(() => validatePromptInfo(promptInfo2)).not.toThrowError();
        expect(() => validatePromptInfo(promptInfo3)).not.toThrowError();
    });

    /** @type {PromptInfo} */
    let wrongPrompt1 = {}

    it('validate wrong prompt 1', function() {
        expect(() => validatePromptInfo(wrongPrompt1)).toThrowError('You must give a prompt the prompt string!');
        
        wrongPrompt1.prompt = 'This is a prompt';
        expect(() => validatePromptInfo(wrongPrompt1)).not.toThrowError('You must give a prompt the prompt string!');
        expect(() => validatePromptInfo(wrongPrompt1)).toThrowError('You must give a prompt the channel to send the prompt on!');

        wrongPrompt1.channel = {
            type: 'voice'
        };
        expect(() => validatePromptInfo(wrongPrompt1)).not.toThrowError('You must give a prompt the channel to send the prompt on!');
        expect(() => validatePromptInfo(wrongPrompt1)).toThrowError('The prompt channel must be a text or DM channel!');

        wrongPrompt1.channel = {
            type: 'text'
        };
        expect(() => validatePromptInfo(wrongPrompt1)).not.toThrowError('The prompt channel must be a text or DM channel!');
        expect(() => validatePromptInfo(wrongPrompt1)).toThrowError('You must give a prompt the user id to tag the user who must respond.');

        wrongPrompt1.userId = '0000';
        expect(() => validatePromptInfo(wrongPrompt1)).not.toThrowError('You must give a prompt the user id to tag the user who must respond.');
        expect(() => validatePromptInfo(wrongPrompt1)).not.toThrowError();

        let newPromptInfo = validatePromptInfo(wrongPrompt1);
        expect(newPromptInfo).toEqual({
            prompt: 'This is a prompt',
            channel: { type: 'text' },
            userId: '0000',
            time: Infinity,
            cancelable: false,
        });
    })

});