const ChromecastAPI = require('chromecast-api');
const inquirer = require('inquirer');
let device = null;

const closeProcess = () => {
    if (device !== null) {
        device.stop();
        device.close();
    }

    process.exit();
};

process.on('SIGHUP', closeProcess);
process.on('SIGINT', closeProcess);

const controlVideo = async () => {
    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'control',
            message: 'Controls',
            choices: [
                {
                    name: 'Play / pause',
                    value: 'playpause'
                },
                {
                    name: 'Stop',
                    value: 'stop'
                },
                {
                    name: '+10 seconds',
                    value: 'seek'
                },
                {
                    name: '-10 seconds',
                    value: 'rewind'
                }
            ]
        }
    ]).catch(console.error);

    switch (answer.control) {
        case 'playpause':
            device._playing ? device.pause() : device.unpause();
            break;

        case 'stop':
            device.stop();
            device.close();
            process.exit();
            break;

        case 'seek':
            device.seek(10);
            break;

        case 'rewind':
            device.seek(-10);
            break;
    }

    controlVideo();
};

inquirer.prompt([
    {
        type: 'input',
        name: 'url',
        message: 'Video URL',
        validate: (value) => {
            if (value.length > 10) {
                return true;
            }

            return 'Please enter a valid URL';
        }
    }
]).then(answer => {
    const browser = new ChromecastAPI.Browser();

    browser.on('deviceOn', async (foundDevice) => {
        device = foundDevice;

        device.play(answer.url, 0, async () => {
            console.log('Playing in your chromecast');
            await controlVideo();
        });
    });
});
