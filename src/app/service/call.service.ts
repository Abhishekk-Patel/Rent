import { Injectable, ElementRef } from '@angular/core';
import { SocketService } from './socket.service';
export interface CallState {
  peerConnection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isVideoCall: boolean;
  selectedChat: any;
  localVideo?: ElementRef;
  remoteVideo?: ElementRef;
}

@Injectable({ providedIn: 'root' })
export class CallService {
  async initWebRTC(
    state: CallState,
    isCaller: boolean,
    socketService: SocketService,
    onEndCall: () => void
  ) {
    const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    state.peerConnection = new RTCPeerConnection(config);

    state.peerConnection.onicecandidate = (event) => {
      if (event.candidate && state.selectedChat) {
        socketService.emit('webrtc_ice_candidate', {
          candidate: event.candidate,
          ownerId: state.selectedChat.ownerId,
          buyerId: state.selectedChat.buyerId
        });
      }
    };

    state.peerConnection.ontrack = (event) => {
      if (!state.remoteStream) {
        state.remoteStream = new MediaStream();
        setTimeout(() => {
          if (state.remoteVideo)
            state.remoteVideo.nativeElement.srcObject = state.remoteStream;
        }, 0);
      }
      state.remoteStream.addTrack(event.track);
    };

    try {
      state.localStream = await navigator.mediaDevices.getUserMedia({
        video: state.isVideoCall,
        audio: true,
      });
      state.localStream.getTracks().forEach((track) => {
        state.peerConnection!.addTrack(track, state.localStream!);
      });
      setTimeout(() => {
        if (state.localVideo)
          state.localVideo.nativeElement.srcObject = state.localStream;
      }, 0);
    } catch (err) {
      alert('Could not access camera/microphone');
      onEndCall();
      return;
    }

    if (isCaller && state.selectedChat) {
      const offer = await state.peerConnection.createOffer();
      await state.peerConnection.setLocalDescription(offer);
      socketService.emit('webrtc_offer', {
        offer,
        isVideo: state.isVideoCall,
        ownerId: state.selectedChat.ownerId,
        buyerId: state.selectedChat.buyerId
      });
    }
  }

  async handleOffer(
    state: CallState,
    offer: any,
    isVideo: boolean,
    socketService: SocketService,
    onEndCall: () => void
  ) {
    state.isVideoCall = isVideo;
    await this.initWebRTC(state, false, socketService, onEndCall);
    await state.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await state.peerConnection!.createAnswer();
    await state.peerConnection!.setLocalDescription(answer);
    if (state.selectedChat) {
      socketService.emit('webrtc_answer', {
        answer,
        ownerId: state.selectedChat.ownerId,
        buyerId: state.selectedChat.buyerId
      });
    }
  }

  async handleAnswer(state: CallState, answer: any) {
    if (state.peerConnection && state.peerConnection.signalingState === 'have-local-offer') {
      await state.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  async handleIceCandidate(state: CallState, candidate: any) {
    await state.peerConnection!.addIceCandidate(new RTCIceCandidate(candidate));
  }

  cleanupCall(state: CallState) {
    if (state.peerConnection) {
      state.peerConnection.close();
      state.peerConnection = null;
    }
    if (state.localStream) {
      state.localStream.getTracks().forEach((track) => track.stop());
      state.localStream = null;
    }
    if (state.remoteStream) {
      state.remoteStream.getTracks().forEach((track) => track.stop());
      state.remoteStream = null;
    }
  }
}
