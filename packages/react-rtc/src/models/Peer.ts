export default class Peer {
  pc: RTCPeerConnection;
  dataChannel: RTCDataChannel;
  displayName: string;

  constructor({
    peerConnection,
    dataChannel,
    displayName,
  }: {
    peerConnection: RTCPeerConnection;
    dataChannel: RTCDataChannel;
    displayName: string;
  }) {
    this.pc = peerConnection;
    this.dataChannel = dataChannel;
    this.displayName = displayName;
  }
}
