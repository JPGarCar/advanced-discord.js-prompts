const { Role, Client, Guild, TextChannel } = require("discord.js");
const RestrictedPrompt = require("../../prompts/restricted-prompt");
const RolePrompt = require("../../prompts/role-prompt");

describe('Restricted Prompt Specs', function() {

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

        beforeEach(() => {
            promptInfo = {
                prompt: 'Prompt text!!!',
                userId: '0000',
                channel: channel,
            };
        });

        let client = new Client()
        let guild = new Guild(client, { id: '0000' });
        let role1 = new Role(client, { id: '0001' }, guild);
        let role2 = new Role(client, { id: '0002' }, guild);
        let role3 = new Role(client, { id: '0003' }, guild);

        it('edits the prompt correctly', async () => {
            let spy = spyOn(RolePrompt, 'single').and.returnValue('role');
            let list = ['role 2', 'role 3'];
            let response = await RestrictedPrompt.single(RolePrompt.single, promptInfo, list);
            expect(spy).toHaveBeenCalledOnceWith({
                prompt: `${promptInfo.prompt} \n Unavailable responses: role 2, role 3`,
                channel: promptInfo.channel,
                userId: promptInfo.userId,
                time: undefined,
                cancelable: undefined,
            });
            expect(response).toEqual('role');
        });

        it('re-prompts if response is in list', async () => {
            let count = 0;
            let spy = spyOn(RolePrompt, 'single').and.callFake(() => {
                if (count === 0) {
                    count ++;
                    return role1;
                } else return role3;
            });

            let response = await RestrictedPrompt.single(RolePrompt.single, promptInfo, [role1, role2]);
            expect(spy).toHaveBeenCalledTimes(2);
            expect(response).toEqual(role3);
        });

        it('does not re-prompt if response is not in list', async () => {
            let spy = spyOn(RolePrompt, 'single').and.returnValue(role1);
            let response = await RestrictedPrompt.single(RolePrompt.single, promptInfo, [role2, role3]);
            
            expect(spy).toHaveBeenCalledTimes(1);
            expect(response).toEqual(role1);
        });

        it('throws error if list items do not match response item', async () => {
            let textChannel = new TextChannel(guild, { id: '0203' });
            let spy = spyOn(RolePrompt, 'single').and.returnValue(role1);
            await expectAsync(RestrictedPrompt.single(RolePrompt.single, promptInfo, [textChannel])).toBeRejectedWithError('List and response items do not match!');
        });

    });


});