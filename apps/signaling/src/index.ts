import { createServer } from 'http';
import { createSignalingServer } from '@torolocos/signaling-server';
import 'dotenv/config';

const server = createServer();

createSignalingServer(server);

server.listen(process.env.PORT);
