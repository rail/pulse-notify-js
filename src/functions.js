import colors from 'colors';
import AWS from 'aws-sdk';
import request from 'superagent';

function exchangePrefix(exchange){
  switch (exchange){
    case "exchange/taskcluster-queue/v1/task-completed":
      return "[OK]".green;
    case "exchange/taskcluster-queue/v1/task-failed":
      return "[FAILED]".red;
    case "exchange/taskcluster-queue/v1/task-exception":
      return "[EXCEPTION]".magenta;
    default:
      return "[UNKNOWN]".yellow;
  }
}

function routeImportant(route) {
  return [
    /checksums/,
    /final_verify/,
    /bouncer_submitter/,
    /push_to_cdn/,
    /updates/,
    /uptake/,
    /version_bump/,
  ].some(x => x.test(route));
}

export async function processMessage(msg, queue, config){
  let task = await queue.task(msg.routing.taskId);
  let prefix = exchangePrefix(msg.exchange);
  if (msg.routes.some(routeImportant)){
    prefix = prefix.bgWhite;
  }
  console.log(`${prefix} ${msg.routing.taskId} ${task.metadata.name}`);
  if (config.logUpload){
    try {
      await logUpload(msg, task, queue, config);
    } catch (e){
      throw(`err: ${e}`);
    }
  }
}

async function logUpload(msg, task, queue, config){
  let taskId = msg.routing.taskId;
  let runId = msg.routing.runId;
  let logUrl = '';
  if (task.provisionerId === 'aws-provisioner-v1') {
    logUrl = `https://queue.taskcluster.net/v1/task/${taskId}/runs/${runId}/artifacts/public%2Flogs%2Flive_backing.log`;
  } else if (task.provisionerId === 'buildbot-bridge') {
    let props = await queue.getArtifact(taskId, runId, 'public/properties.json');
    logUrl = props.log_url[0];
  } else {
    //console.log(`No idea how to handle ${task.provisionerId} in ${taskId}`);
    return;
  }
  let suffix = logUrl.split('/').pop();
  let logName = `${taskId}.${runId}-${suffix}`;
  await doUploadLog(logUrl, logName, config)
}

async function doUploadLog(url, s3Key, config) {
  AWS.config.update(config.logUpload.credentials);
  let s3 = new AWS.S3();
  try {
    let res = await request.get(url);
    let s3Options = {Bucket: config.logUpload.bucket, Key: s3Key, Body: res.text, ContentType: res.type};
    //console.log(`upload started ${s3Key}`);
    await s3.putObject(s3Options).promise();
    //console.log(`upload done`);
  } catch (e) {
    throw(`awwww: ${e}`);
  }

}
