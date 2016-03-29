import taskcluster from 'taskcluster-client';
import program from 'commander';
import {processMessage} from './functions';

program.option('-c, --config <config>', 'Path to config file').parse(process.argv);

let config = require(program.config);
let listener = new taskcluster.PulseListener(config.pulse);
let queueEvents = new taskcluster.QueueEvents();
let queue = new taskcluster.Queue(config.taskcluster);

listener.bind(queueEvents.taskCompleted(config.taskcluster.routingKey));
listener.bind(queueEvents.taskFailed(config.taskcluster.routingKey));
listener.bind(queueEvents.taskException(config.taskcluster.routingKey));

listener.on('message', (msg) => {
  return processMessage(msg, queue);
});

listener.resume().then(function() {
  console.log('listening'.blue);
});
