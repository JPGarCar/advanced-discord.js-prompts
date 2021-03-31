# Advanced Discord.js Prompts
This JavaScript module brings over 20 different types of prompts to interact with 
users via Discord using Discord.js and/or Discord.js-commando.

## Features
### Highly Customizable
All prompts can be easily customizable. In the future we hope to introduce the use of embeds with even more customization!
### Time limit
Prompts can be given a time limit. Users will have to resolve the prompt within that time frame.
### Prompt Cancellation
Most prompts can be canceled by the user. However, the developer can mark prompts as not
cancelable. 
### Safe User-Guided Prompts
Prompts are user guided, this means only one user is allowed to respond to the prompt. This allows you to send multiple prompts to different users to the same channel with no issues.
### Discord.js Oriented Prompts
We have Discord.js specific prompts like Member, Channel, Emoji, and Role prompts which will return the Discord.js Objects for easier development.
### Advanced List Prompts
The ListPrompt class has customizable prompts that allow the user to select one or many options out of a list of options. They can be used with anything (Channels, Roles, Text, Numbers)!
### Fully Tested and 100% Test Coverage
This package is 100% Test Covered and it is used by other bots we produce!

## Usage
### Check our Documentation
You can take a look at our documentation with tutorials [here!](https://jpgarcar.github.io/advanced-discord.js-prompts/index.html)
### Basic Tutorial
1. Install the npm package (add '--production' to not install our unit testing packages)
```javascript
npm install advanced-discord.js-prompts --production
```
2. Import the prompt type that you need.
```javascript
const { MemberPrompt } = require('advanced-discord.js-prompts');
```
3. Use the static functions.
```javascript
let guildMember = await MemberPrompt.single({
    prompt: 'Please tag your friend',
    channel: message.channel,
    userId: message.author.id,
    time: Infinity, // Infinity by default (no time limit)
    cancelable: false // true by default
});
```
If you want to have a time limit or for the prompt to be cancelable you need to expect either of the two errors.
```javascript
try {
    var guildMember = await MemberPrompt.single({
        prompt: 'Please tag your friend',
        channel: message.channel,
        userId: message.author.id,
        time: Infinity, // Infinity by default (no time limit)
        cancelable: false // true by default
    });
} catch (error) {
    // add the error to the require clause const = { TimeOutError, MemberPrompt } ...
    // you can also check the error name (error.name === 'TimeOutError')
    if (error == TimeOutError) {
        // the user timed out
    } 
    // add the error to the require clause const = { CancelError, MemberPrompt } ...
    // you can also check the error name (error.name === 'CancelError')
    else if (error == CancelError) {
        // the user canceled the prompt
    }
}
```

## Structure
All prompts follow the same structure, naming convention and information needed.
Each prompt type is divided in classes with similar output, for example, the ChannelPrompt class has static functions that will prompt and return Channels.

### Errors
Apart from the TimeOutError and CancelError that you should expect for ass seen in the usage section. The module will show errors if the prompt information is not valid. You should fix those in code, the user can not fix these errors.

### Prompt Info
All prompts require prompt information. The prompt information consists of:
- prompt -> the text to use to prompt the user
- channel -> the text or DM channel to prompt the user on
- userId -> the user's ID to be prompted
- time? -> (optional) the amount of time the user has to resolve the prompt
- cancelable? -> (optional) if the user can cancel the prompt

## Available Prompts
### Message Prompt
The message prompt is the base prompt for most other prompts. It will request the basic 
prompt information and return a Discord.js Message object.
### Channel Prompt
Prompts the user for Discord text channels by responding with a mention.
### Member Prompt
Prompts the user for guild members by responding with user mentions.
### Number Prompt
Prompts the user for x amount of numbers. Prompt ensures the response are numbers only.
### Role Prompt
Prompts the user for Guild Roles by responding with a role mention.
### String Prompt
Prompts the user for a string or text.
### List Prompt
Prompts the user to select one or x amount of options out of a list either via emoji reaction or by typing list indexes.
### Special Prompt
Prompts the user for emojis or for a yes/no response for boolean values.

## Development
Please feel free to add feature request or bug issues on our github. We are constantly developing this package for our other bots!

## Future Plans
- [x] add unit testings
- [ ] add tutorials
- [ ] add embed support
- [ ] add optional console logging with winston

## Authors
[Juan Pablo Garcia](https://github.com/JPGarCar)
[Maggie Wang](https://github.com/mwang2000)