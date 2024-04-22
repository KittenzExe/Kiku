export const user = (uid: string) => `
    <!DOCTYPE html>
    <html>
        <head>
            <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@700&display=swap" rel="stylesheet">
            <script>
                let ws = new WebSocket('wss://kiku.kittenzexe.com/v1/${uid}');
                let status = true;
                let listen = "";
                let username = ""; // Declare username here

                ws.onmessage = function incoming(event) {
                    try {
                        const jsonData = JSON.parse(event.data);
                        console.log(jsonData);
                
                        const spotifyStatus = jsonData.spotify_status;
                        if (spotifyStatus !== "Not listening on Spotify") {
                            listen = "is listening to:";
                            const id = jsonData.id;
                            username = jsonData.username;
                            const track = jsonData.spotify_status.track;
                            const artist = jsonData.spotify_status.artist;
                            const album = jsonData.spotify_status.album;
                            const duration = jsonData.spotify_status.duration;
                            const currentPosition = jsonData.spotify_status.current_position;
                            const albumCoverUrl = jsonData.spotify_status.album_cover_url;
                
                            document.getElementById('albumCoverBig').src = albumCoverUrl;
                            document.getElementById('albumCoverSmall').src = albumCoverUrl;
                            document.getElementById('prefix').textContent = 'by ';
                            document.getElementById('track').textContent = track;
                            document.getElementById('artist').textContent = artist;
                
                            document.getElementById('progress').style.width = calculateProgress(currentPosition, duration) + '%';
                            document.getElementById('current').textContent = formatTime(currentPosition);
                            document.getElementById('total').textContent = formatTime(duration);
                        } else {
                            if (spotifyStatus === "Not listening on Spotify") {
                                status = false;
                                username = jsonData.username;
                                listen = "is not listening to anything right now.";
                            }
                        }
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                    }
                
                    document.getElementById('username').textContent = typeof username === 'string' ? username : 'Unknown'; // Check if username is a string
                    document.getElementById('listen').textContent = listen;
                
                    const albumCoverSmall = document.getElementById('albumCoverSmall');
                    if (!status) {
                        albumCoverSmall.style.width = '0';
                        albumCoverSmall.style.height = '0';
                    } else {
                        albumCoverSmall.style.width = '250px';
                        albumCoverSmall.style.height = '250px';
                    }
                };
            </script>
        </head>
        <body style="margin: 0; padding: 0; height: 100vh; width: 100vw; overflow: hidden;">
            <div style="height: 100vh; width: 100vw; background: #000000; margin: 0; display: flex; justify-content: center; align-items: center; overflow: hidden; position: relative;">
                <img id="albumCoverBig" style="min-width: 100%; min-height: 100vh; object-fit: cover; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.25; filter: blur(5px);">
                <div style="height: 250px; position: relative; z-index: 1; text-align: center; display: flex;">
                    <img id="albumCoverSmall" style="border-radius: 25px; border: none;">
                    <div style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: left;">
                        <div style="margin-left: 10px;">
                            <h1 style="font-family: 'Comfortaa', sans-serif; color: #f4f4f4; line-height: 0;">
                                <span id="username"></span>
                                <span id="listen"></span>
                            </h1>
                            <h1 id="track" style="font-family: 'Comfortaa', sans-serif; color: #f4f4f4; max-width: 500px;"></h1>
                            <h2 style="font-family: 'Comfortaa', sans-serif; color: #f4f4f4; max-width: 500px; line-height: 0;"><span id="prefix"></span><span id="artist"></span></h2>
                        </div>
                    </div>
                </div>
            </div>
        </body>
    </html>
`;