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
                    name: '+30 minutes',
                    value: 'seek30m'
                },
                {
                    name: '+10 minutes',
                    value: 'seek10m'
                },
                {
                    name: '+5 minutes',
                    value: 'seek5m'
                },
                {
                    name: '+1 minute',
                    value: 'seek1m'
                },
                {
                    name: '+30 seconds',
                    value: 'seek30s'
                },
                {
                    name: '+10 seconds',
                    value: 'seek10s'
                },
                {
                    name: '-30 minutes',
                    value: 'rewind30m'
                },
                {
                    name: '-10 minutes',
                    value: 'rewind10m'
                },
                {
                    name: '-5 minutes',
                    value: 'rewind5m'
                },
                {
                    name: '-1 minute',
                    value: 'rewind1m'
                },
                {
                    name: '-30 seconds',
                    value: 'rewind30s'
                },
                {
                    name: '-10 seconds',
                    value: 'rewind10s'
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

        case 'seek30m':
            device.seek(30 * 60);
            break;

        case 'seek10m':
            device.seek(10 * 60);
            break;

        case 'seek5m':
            device.seek(5 * 60);
            break;

        case 'seek1m':
            device.seek(60);
            break;

        case 'seek30s':
            device.seek(10);
            break;

        case 'seek10s':
            device.seek(10);
            break;

        case 'rewind30m':
            device.seek(-30 * 60);
            break;

        case 'rewind10m':
            device.seek(-10 * 60);
            break;

        case 'rewind5m':
            device.seek(-5 * 60);
            break;

        case 'rewind1m':
            device.seek(-60);
            break;

        case 'rewind30s':
            device.seek(-30);
            break;

        case 'rewind10s':
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
