const config = require('./config');
const { fork } = require('child_process');
const colors = require('colors');
const rlSync = require('readline-sync');
const exec = require('child_process').execFile;
const path = require('path');
const os = require('os');
let manifest = require(path.join(config.executable.path, config.executable.manifest));
const pluginExe = os.platform == 'win32' ? config.executable.winexe : config.executable.osxexe;

const forked = fork('server.js');
console.log('<status>Web Socket Server Started....'.green);

console.log('Green Text denotes hardware action\nGreen Highlight denotes hardware messages sent\nCyan highlight denotes messages received from plugin\n');

// Registration Stuff
let info = {
    'application': {
      'language': 'en', 
      'platform': os.platform == 'win32' ? config.server.winplatform : config.server.osxplatform,
      'version': '4.0.0'
    }, 
    'devices': [
      {
        'id': config.server.deviceId, 
        'size': {
          'columns': 5, 
          'rows': 3
        }, 
        'type': 0
      }
    ]
  };

let registrationParams = ['-port', config.server.port, '-pluginUUID', manifest.Actions[0].UUID,'-registerEvent','registerEvent','-info', JSON.stringify(info)];
exec(pluginExe, registrationParams, { cwd: config.executable.path }, (err, data) => {
    if(err){
        console.log(`ERROR: ${err}`.red);
    } else {
        console.log(`DATA: ${data}`.green);
    }
} );

// Type b at any time to send a KeyUp event to the plugin
promptUser();

function promptUser() {
    var cmd = rlSync.question(`
    Enter: 
    'kd' for keyDown 
    'ku' for keyUp
    'wa' for willAppear
    'wd' for willDisappear
    'dc' for deviceDidConnect
    'dd' for deviceDidDisconnect\n`);

    switch(cmd) {
        case 'kd':
            forked.send('keyDown');
            break;
        case 'ku':
            forked.send('keyUp');
            break;
        case 'wa':
            forked.send('willAppear');
            break;
        case 'wd':
            forked.send('willDisappear');
            break;
        case 'dc':
            forked.send('deviceDidConnect');
            break;
        case 'dd':
            forked.send('deviceDidDisconnect');
        default:
            break;
    }
    promptUser();
}



