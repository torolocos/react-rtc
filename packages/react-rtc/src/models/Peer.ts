export default class Peer {
  uuid: string;
  pc: RTCPeerConnection;
  dataChannel: RTCDataChannel;

  constructor({
    uuid,
    peerConnection,
    dataChannel,
  }: {
    uuid: string;
    peerConnection: RTCPeerConnection;
    dataChannel: RTCDataChannel;
  }) {
    this.uuid = uuid;
    this.pc = peerConnection;
    this.dataChannel = dataChannel;
  }
}
