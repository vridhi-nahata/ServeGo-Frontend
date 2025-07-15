// import React, { useEffect, useRef, useState } from 'react';
// import AgoraRTC from 'agora-rtc-sdk-ng';

// const APP_ID = "ac4e55167256496fa2cef8cbcab8c76b"; // 🔁 Replace with your actual App ID
// const TOKEN = null; // null means we're using "App ID" mode
// const CHANNEL = "servego-demo"; // You can make this dynamic (e.g., booking ID)

// const AgoraCall = ({ isVideo = true, onEnd }) => {
//   const [client] = useState(() =>
//     AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
//   );
//   const localContainer = useRef(null);
//   const remoteContainer = useRef(null);

//   useEffect(() => {
//     const joinCall = async () => {
//       await client.join(APP_ID, CHANNEL, TOKEN, null);

//       const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

//       await client.publish([micTrack, ...(isVideo ? [camTrack] : [])]);

//       if (isVideo) {
//         camTrack.play(localContainer.current);
//       }

//       client.on('user-published', async (user, mediaType) => {
//         await client.subscribe(user, mediaType);
//         if (mediaType === 'video' && remoteContainer.current) {
//           user.videoTrack.play(remoteContainer.current);
//         }
//         if (mediaType === 'audio') {
//           user.audioTrack.play();
//         }
//       });
//     };

//     joinCall();

//     return () => {
//       const leaveCall = async () => {
//         const tracks = client.localTracks || [];
//         tracks.forEach((track) => {
//           track.stop();
//           track.close();
//         });
//         await client.leave();
//         if (onEnd) onEnd();
//       };
//       leaveCall();
//     };
//   }, [client]);

//   return (
//     <div className="flex justify-center gap-6 p-6">
//       <div>
//         <h4 className="text-center font-bold">You</h4>
//         <div ref={localContainer} className="w-64 h-48 bg-black rounded-md"></div>
//       </div>
//       <div>
//         <h4 className="text-center font-bold">Other</h4>
//         <div ref={remoteContainer} className="w-64 h-48 bg-black rounded-md"></div>
//       </div>
//     </div>
//   );
// };

// export default AgoraCall;
