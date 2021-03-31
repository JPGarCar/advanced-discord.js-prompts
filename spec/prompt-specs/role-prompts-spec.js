const { Collection } = require("discord.js");
const MessagePrompt = require("../../prompts/message-prompt");
const RolePrompt = require("../../prompts/role-prompt");

describe('Role Prompts Specs', function() {

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
        });

        it('calls instruction prompt with correct params', async () => {
            spy.and.returnValue({ mentions: { roles: new Collection([['role 1', {}]])}});
            await RolePrompt.multi(promptInfo);
            expect(spy).toHaveBeenCalledOnceWith(promptInfo, MessagePrompt.InstructionType.MENTION, Infinity);
        });

        it('prompts again with incorrect amount', async () => {
            let count = 0;
            spy.and.callFake(() => {
                if (count === 0) {
                    count++;
                    return { mentions: { roles: new Collection([['role 1', {} ]]) } };
                } else return { mentions: { roles: new Collection([['role 1', {} ], ['role 2', {} ]])}};
            });
            let roles = await RolePrompt.multi(promptInfo, 2);
            expect(spy).toHaveBeenCalledTimes(2);
            expect(channel.send).toHaveBeenCalledTimes(1);
            expect(roles).toEqual(new Collection([['role 1', {} ], ['role 2', {} ]]));
        });

        it('prompts again with infinite amount and no mentions', async () => {
            let count = 0;
            spy.and.callFake(() => {
                if (count === 0) {
                    count++;
                    return { mentions: { roles: new Collection() } };
                } else return { mentions: { roles: new Collection([['role 1', {} ], ['role 2', {} ]])}};
            });
            let roles = await RolePrompt.multi(promptInfo, 2);
            expect(spy).toHaveBeenCalledTimes(2);
            expect(channel.send).toHaveBeenCalledTimes(1);
            expect(roles).toEqual(new Collection([['role 1', {} ], ['role 2', {} ]]));
        });

        it('works well', async () => {
            spy.and.returnValue({ mentions: { roles: new Collection([['role 1', {} ], ['role 2', {} ]])}});
            let roles = await RolePrompt.multi(promptInfo, 2);
            expect(spy).toHaveBeenCalledTimes(1);
            expect(channel.send).toHaveBeenCalledTimes(0);
            expect(roles).toEqual(new Collection([['role 1', {} ], ['role 2', {} ]]));
        });

    });

    describe('Single', function() {
        it('calls the multi function', async () => {
            let spy = spyOn(RolePrompt, 'multi').and.returnValue(new Collection([['role 1', 'ROLE']]));
            let role = await RolePrompt.single(promptInfo);
            expect(role).toEqual('ROLE');
            expect(spy).toHaveBeenCalledOnceWith(promptInfo, 1);
        })
    });

});