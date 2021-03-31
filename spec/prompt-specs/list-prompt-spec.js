const { Collection, Channel, Client, Role, Guild, User, GuildMember } = require("discord.js");
const { CancelError, TimeOutError } = require("../../errors");
const ListPrompt = require("../../prompts/list-prompts");
const NumberPrompt = require("../../prompts/number-prompt");


describe('List Prompt Specs', function() {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 8000;

    let message1 = {
        content: 'this is the return message for channel',
        delete: jasmine.createSpy('message return delete'),
        channel: { type: 'text' },
        deleted: false,
        mentions: {
            channels: new Collection([['item 1', 1]]),
        },
    };

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

    beforeEach(function() {
        message2.delete.calls.reset();
    });


    describe('List Chooser multiple', function() {

        it('returns the correct list', async () => {

            let list = ['item 1', 'item 2', 'item 3'];
            let amount = 1;

            spyOn(NumberPrompt, 'multi').and.returnValue([1]);

            let returnList = await ListPrompt.multiListChooser(promptInfo, list, amount);

            expect(returnList).toEqual(['item 2']);
        });

        it('returns the correct list with amount of 2', async () => {
            let list = ['time 1', 'time 2', 'time 3', 'time 4'];
            let amount = 2;

            spyOn(NumberPrompt, 'multi').and.returnValue([0, 2]);
            let items = await ListPrompt.multiListChooser(promptInfo, list, amount);
            expect(items).toEqual(['time 1', 'time 3']);
        });

        it('asks again if the number of responses is not equal to amount requested', async () => {
            let list = ['time 1', 'time 2', 'time 3', 'time 4'];
            let amount = 2;

            let count = 0;
            let spy = spyOn(NumberPrompt, 'multi').and.callFake(() => {
                if (count === 0) {
                    count++;
                    return [1];
                } else {
                    return [1, 2];
                }

            });

            await ListPrompt.multiListChooser(promptInfo, list, amount);
            expect(spy).toHaveBeenCalledTimes(2);
        });

        it('throws a cancel error', async () => {

            let list = ['item 1'];
            let amount = 1;

            spyOn(NumberPrompt, 'multi').and.throwError('This is an error');

            await expectAsync(ListPrompt.multiListChooser(promptInfo, list, amount)).toBeRejectedWithError();
            expect(message2.delete).toHaveBeenCalled();
        });

        it('deletes the prompt message', async () => {
            let list = ['time 1'];
            let amount = 1;

            spyOn(NumberPrompt, 'multi').and.returnValue([0]);
            let items = await ListPrompt.multiListChooser(promptInfo, list, amount);
            expect(message2.delete).toHaveBeenCalled();
            expect(items).toEqual(list);
        });

        it('works with a list of channels', async () => {
            let client = new Client();
            let channel1 = new Channel(client, {
                name: 'text-1',
                type: 'text',
                id: '0001',
            });
            let channel2 = new Channel(client, {
                name: 'text-2',
                type: 'text',
                id: '0002',
            });
            let list = [channel1, channel2];

            let amount = 1;

            spyOn(NumberPrompt, 'multi').and.returnValue([1]);
            let items = await ListPrompt.multiListChooser(promptInfo, list, amount);
            expect(items).toEqual([channel2]);

        });

        it('works with a list of roles', async () => {
            let client = new Client();
            let guild = new Guild(client, { name: 'Guild 1', id: '0001'});
            let role1 = new Role(client, {
                name: 'role 1',
                id: '0001'
            }, guild);
            let role2 = new Role(client, { name: 'role 2', id: '0002'}, guild);
            let list = [role1, role2];
            let amount = 1;

            spyOn(NumberPrompt, 'multi').and.returnValue([0]);
            let items = await ListPrompt.multiListChooser(promptInfo, list, amount);
            expect(items).toEqual([role1]);
        });

        it('works with a list of members', async () => {
            let client = new Client();
            let guild = new Guild(client, { name: 'Guild 1', id: '0001'});
            let member1 = new GuildMember(client, { id: '0001', user: { id: '0001' } }, guild);
            let member2 = new GuildMember(client, { id: '0002', user: { id: '0002' } }, guild);
            let member3 = new GuildMember(client, { id: '0003', user: { id: '0003' } }, guild);
            let list = [member1, member2, member3];

            let amount = 1;
            spyOn(NumberPrompt, 'multi').and.returnValue([1]);
            let item = await ListPrompt.multiListChooser(promptInfo, list, amount);
            expect(item).toEqual([member2]);
        });
    });

    describe('List Choose Single', function() {

        it ('calls multi list chooser with amount of 1', async () => {

            let list = ['item 1', 'item 2', 'item 3'];
            let spy = spyOn(ListPrompt, 'multiListChooser').and.returnValue(['item 1']);

            let item = await ListPrompt.singleListChooser(promptInfo, list);
            expect(spy).toHaveBeenCalledTimes(1);
            expect(item).toEqual('item 1');
        });
    });

    describe('Reaction Picker', function() {

        let option1 = {
            name: 'option 1',
            description: 'option 1 description',
            emojiName: '🔪',
        };
        let option2 = {
            name: 'Option 2',
            description: 'Option 2 description',
            emojiName: '💩',
        };
        let option3 = {
            name: 'Option 3',
            description: 'Option 3 description',
            emojiName: '☝️'
        };
        let options = [option1, option2, option3];

        describe('Multi', function() {

            message2.react = jasmine.createSpy('react to message');

            beforeEach(function() {
                channel.send.calls.reset();
                message2.react.calls.reset();
            });

            it('send message and creates the await reaction and it works', async () => {
                message2.awaitReactions = jasmine.createSpy('create reactions').and.returnValue(
                    new Collection([
                        ['reaction 1', { emoji: { name: '☝️' } }]
                    ])
                );

                let returnOptions = await ListPrompt.multiReactionPicker(promptInfo, options, 1);
                expect(channel.send).toHaveBeenCalledTimes(1);
                expect(message2.awaitReactions).toHaveBeenCalledOnceWith(jasmine.any(Function), {
                    max: 1,
                    time: null,
                    errors: ['time']
                });
                expect(message2.delete).toHaveBeenCalledTimes(1);
                expect(returnOptions).toEqual([ option3 ]);
            });

            it('sends message, reacts correctly, deletes message, returns correctly', async () => {

                message2.awaitReactions = jasmine.createSpy('create reactions').and.returnValue(
                    new Collection([
                        ['reaction 1', { emoji: { name: '☝️' } }],
                        ['reaction 2', { emoji: { name: '🔪' } }],
                    ])
                );

                promptInfo.time = 10;

                let returnOptions = await ListPrompt.multiReactionPicker(promptInfo, options, 2);
                expect(channel.send).toHaveBeenCalled();
                expect(message2.awaitReactions).toHaveBeenCalledOnceWith(jasmine.any(Function), {
                    max: 2, time: 10, errors: ['time']
                });
                expect(message2.react).toHaveBeenCalledTimes(3);
                expect(message2.delete).toHaveBeenCalledTimes(1);
                expect(returnOptions).toEqual([option1, option3]);
            });

            it('throws time out error and deletes message', async () => {

                let error = new Error();
                error.name = 'time';
                message2.awaitReactions = jasmine.createSpy('create reactions').and.throwError(error);
                await expectAsync(ListPrompt.multiReactionPicker(promptInfo, options, 1)).toBeRejectedWithError(TimeOutError);
                expect(message2.delete).toHaveBeenCalledTimes(2);

            });

        });
    
        describe('Single', function() {
            it('calls multi reaction picker with amount of 1', async () => {
                let spy = spyOn(ListPrompt, 'multiReactionPicker').and.returnValue([option1]);
                let option = await ListPrompt.singleReactionPicker(promptInfo, options);
                expect(spy).toHaveBeenCalledOnceWith(promptInfo, options, 1);
                expect(option).toEqual(option1);
            });
        });

    });


});