import AgoraRTC from "agora-rtc-sdk-ng";
import { store as appStore } from "./store";
import {
  toggleAudioMute,
  toggleVideoMute,
  callEnd,
  increaseUserCount,
  decreaseUserCount
} from "./reducer";



export const initSDK = async (localUserContainer) => {
  const [
    audioTrack,
    videoTrack
  ] = await AgoraRTC.createMicrophoneAndCameraTracks();
  return [audioTrack, videoTrack]
}

export const handleToggleMic = () => {
  appStore.dispatch(toggleAudioMute());
};
export const handleToggleVideo = () => {
  appStore.dispatch(toggleVideoMute());
};

