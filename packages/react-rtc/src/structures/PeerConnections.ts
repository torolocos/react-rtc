import Peer from '../models/Peer';

export default class PeerConnections {
  private peers = new Map<string, Peer>();

  get lenght() {
    return this.peers.size;
  }

  add({
    id,
    peerConnection,
    dataChannel,
  }: {
    id: string;
    peerConnection: RTCPeerConnection;
    dataChannel: RTCDataChannel;
  }) {
    const peer = new Peer({ id, peerConnection, dataChannel });

    this.peers.set(id, peer);
  }

  get(uuid: string) {
    return this.peers.get(uuid);
  }

  delete(uuid: string) {
    this.peers.delete(uuid);
  }

  forEach(callback: (peer: Peer) => void) {
    this.peers.forEach(callback);
  }
}
