# Signaling Server

This library provides you simple signaling server for [@torolocos/react-rtc](https://www.npmjs.com/package/@torolocos/react-rtc).

## Installation

#### Yarn

```shell
yarn add @torolocos/signaling-server
```

#### npm

```shell
npm install @torolocos/signaling-server
```

## Usage

1.  Create `http` or `https` server and pass it to `createSignalingServer` function.

```ts
import { createServer } from 'http';
import { createSignalingServer } from '@torolocos/signaling-server';

const server = createServer();

createSignalingServer(server);
```

2.  Start your server on the given port.

```ts
server.listen(8000);
```

> See the [signaling](https://github.com/torolocos/react-rtc/tree/main/apps/signaling) app.
