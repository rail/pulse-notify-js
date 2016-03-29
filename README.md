# Simple Release Promotion Notification (JS)

This repo contains simple scripts that demonstrate how to handle release promotion events.

## Install

* Install required JS packages:
```shell
npm install
```
* Done

## Configuration

Example configuration file
```js
module.exports = {
  pulse: {
    // use https://pulseguardian.mozilla.org/ to manage your Pulse credentials
    credentials: {
      username: "xxx",
      password: "xxx"
    },
    // Define queueName to create a durable queue
    // queueName: "notify-js"
  },
  taskcluster: {
    credentials: {
      clientId: "xxx",
      accessToken: "xxx"
    },
    routingKey: 'route.index.releases.v1.#'
  }
};
```

## Running

```shell
npm run start -- -c path/to/your/config.js
```
