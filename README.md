# Rearrange your Spotify music according to their proximity
using the t-SNE algorithm, the Spotify API and a GUI.

# [Test it online!](https://wd400.github.io/Spotify_t-sne_playlist/)


![](demo.gif)

## Getting Started


1- Copy the id of the source playlist in the interface.  
2- Click on "Load playlist".  
3- Draw the music sequence for the new playlist.  
4- Click on "Save" to save the playlist on Spotify.  


## Run it locally
1- Clone this repository

2- Create a Spotify app https://developer.spotify.com/dashboard/applications

3- Edit src/App.js and update the value of clientID to the value from your Spotify app (default abbc32cff69c46928a3b4e0bb7f43fab) and also update the value of redirectUri to 'http://127.0.0.1:3000'.

4- Go to "Edit settings" in your Spotify app and add  "http://127.0.0.1:3000/" to the Redirect URIs list

5- In package.json change homepage value to "http://127.0.0.1:3000"

6- In the repo execute "yarn run start"

7- Go to http://127.0.0.1:3000


Asociated Reddit thread: https://www.reddit.com/r/MachineLearning/comments/uk9mg3/p_tsne_to_view_and_order_your_spotify_tracks/
