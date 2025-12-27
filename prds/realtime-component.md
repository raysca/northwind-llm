## Realtime Component

This component will be used to make a realtime call to the store assistant agent backend. It will take audio input in real time and use audio worklets to process the audio in real time to pcm format that is expected by the backend and send it to the backend in real time over websockets.

This component will be modular and reusable as long as the frontend and backend are using the same audio processing and communication protocols.

Put the components and hooks in a separate folder called "realtime-call" in the "src/components" folder.

# Tasks

- Implement react hook(s) that will be used to handle (split into multiple hooks if needed). Upon initialization, the hook(s) will 
    - Initial Websocket connection
    - When user clicks call button, send initial message to backend to start the call
    - Audio input
    - Audio processing
    - Realtime communication
    - Realtime response processing

- Implement a react hook that will be used to playback the response audio in real time from the backend

- Implement react component(s) that will be used to display the realtime call interface (split into multiple components if needed for modularity, reusability, and maintainability)
    - Audio input (with visual effects)
    - Audio output (with visual effects)
    - Call button
    - End call button
    - Status indicator

- Implement a react component to communicate the status of the realtime call
    - online / offline
    - ongoing / idle
    - e.t.c 
    