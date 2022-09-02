import { useRef } from 'react';
import type { DispatchEvent, Connection } from '../types';
import { useErrorHandler } from './useErrorHandler';

export const useConnection = (dispatchEvent: DispatchEvent) => {
  const connections = useRef(new Map<string, Connection>());
  const handleError = useErrorHandler(dispatchEvent);

  const add = (
    id: string,
    peerConnection: RTCPeerConnection,
    dataChannel: RTCDataChannel
  ) => {
    const connection: Connection = { id, peerConnection, dataChannel };

    connections.current.set(id, connection);
  };

  const get = (id: string) => connections.current.get(id);

  const remove = (id: string) => connections.current.delete(id);

  const forEach = (callback: (connection: Connection, id?: string) => void) =>
    connections.current.forEach(callback);

  const closeAll = () => {
    forEach(({ peerConnection }) => peerConnection.close());
    connections.current.clear();
  };

  const send = ({ id, dataChannel }: Connection, data: string) => {
    try {
      if (dataChannel.readyState !== 'open') dispatchEvent('error');

      dataChannel.send(data);
      dispatchEvent('send', [id, data]);
    } catch (error) {
      handleError(error);
    }
  };

  const sendTo = (id: string, data: string) => {
    const connection = get(id);

    if (connection) send(connection, data);
    else dispatchEvent('error');
  };

  const sendToAll = (data: string) => {
    forEach((connection) => send(connection, data));
  };

  const addTrack = (id: string, track: MediaStreamTrack) => {
    const connection = get(id);

    if (connection) connection.peerConnection.addTrack(track);
    else dispatchEvent('error');
  };

  return {
    add,
    get,
    remove,
    sendTo,
    sendToAll,
    addTrack,
    closeAll,
  };
};
