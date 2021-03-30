const { channelMsg, channelMsgDelete, channelMsgWaitDelete } = require("../../util/discord-util");

describe('Discord Util Specs', function() {

    var message = {
        delete: jasmine.createSpy('messageDelete'),
    };

    beforeEach(function() {
        message.delete.calls.reset();
        channel.send.calls.reset();
    });

    var channel = {
        type: 'text',
        send: jasmine.createSpy('channelSend').and.callFake(function(text) {
            message.content = text;
            return message;
        }),
    };

    it('channelMsg send message to channel with correct text', async function() {
        let msg = await channelMsg(channel, '0000', 'message text');
        expect(channel.send).toHaveBeenCalled();
        expect(msg.content).toBe('<@0000> message text');
    });

    it('channelMsgDelete sends message and deletes message', async function() {
        await channelMsgDelete(channel, '0000', 'message text', 10);
        expect(channel.send).toHaveBeenCalledOnceWith(`<@0000> message text`);
        expect(message.delete).toHaveBeenCalledOnceWith({ timeout: 10 * 1000 });
    });

    // it('channelMsgWaitDelete sends message, waits, then deletes', function() {
    //     jasmine.clock().install();
    //     channelMsgWaitDelete(channel, '0000', 'message text');
    //     expect(channel.send).toHaveBeenCalled();
    //     jasmine.clock().tick(6000);
    //     expect(message.delete).toHaveBeenCalled();
    //     jasmine.clock().uninstall();
    // });

});