import colors from 'colors';

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

export async function processMessage(msg, queue){
  let task = await queue.task(msg.routing.taskId);
  let prefix = exchangePrefix(msg.exchange);
  if (msg.routes.some(routeImportant)){
    prefix = prefix.bgWhite;
  }
  console.log(`${prefix} ${msg.routing.taskId} ${task.metadata.name}`);
}
