export default class Peer {
  id: string;
  pc: RTCPeerConnection;
  dataChannel: RTCDataChannel;

  constructor({
    id,
    peerConnection,
    dataChannel,
  }: {
    id: string;
    peerConnection: RTCPeerConnection;
    dataChannel: RTCDataChannel;
  }) {
    this.id = id;
    this.pc = peerConnection;
    this.dataChannel = dataChannel;
  }
}
