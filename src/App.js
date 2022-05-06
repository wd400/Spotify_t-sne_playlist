import React, { useEffect, useState , useRef} from 'react'
//import { SpotifyApiContext } from 'react-spotify-api'
//import Cookies from 'js-cookie'
import TSNE from 'tsne-js';
import { SpotifyAuth, Scopes } from 'react-spotify-auth'
import 'react-spotify-auth/dist/index.css'
import context from 'react-bootstrap/esm/AccordionContext';



async function getCurrentUserId(token) {
  var url = "https://api.spotify.com/v1/me";
  
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer "+token);
  myHeaders.append("Content-Type", "application/json");
  
  var myInit = { method: 'GET',
               headers: myHeaders,
               mode: 'cors',
               cache: 'default',
               };

let response= await  fetch(url,myInit);

let jsonResponse=  await  response.json();
 return jsonResponse.id;
      
    
  
}







function getCurrentDate(separator=''){

  let newDate = new Date()
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  
  return `${year}${separator}${month<10?`0${month}`:`${month}`}${separator}${date}`
  }

async function buildNewPlaylist(  token,  userId) {
var url = "https://api.spotify.com/v1/users/"+userId+"/playlists";


var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer "+token);
myHeaders.append("Content-Type", "application/json");

var myInit = { method: 'POST',
             headers: myHeaders,
             mode: 'cors',
             cache: 'default' ,
            body: JSON.stringify({
              "name": "t-sne playlist",
              "description": "Generated at " + getCurrentDate(),
              "public": false
            })};

let response =await fetch(url,myInit);

let jsonResponse = await  response.json();
 

      return jsonResponse.id;
    


}



async function saveInPlaylist( token, playlistId, playlist)  {
for (let i = 0; i < playlist.length; i += 100) {
  var url = "https://api.spotify.com/v1/playlists/"+playlistId+"/tracks";



var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer "+token);
myHeaders.append("Content-Type", "application/json");

var myInit = { method: 'POST',
             headers: myHeaders,
             mode: 'cors',
             cache: 'default' ,
            body: JSON.stringify({
              "uris": playlist.slice(i, Math.min(playlist.length, i + 100)),
              "position": i
            })};

await fetch(url,myInit);
}

return true;
}

async function savePlaylist( token,  playlist)  {
  console.log("0")
getCurrentUserId(token).then(
  (userId)=>{
    console.log("userId",userId)
    buildNewPlaylist(token, userId).then(
      (playlistId)=>{
        saveInPlaylist(token, playlistId, playlist)
      }
    )

  }
)



  //create new playlist
  //add with loop
}

async function downloadPlaylistData(token,playlistId)  {
//  let newData = [];
  let result = [];
  let offset = 0;

  while (true) {
     console.log(offset);
    var url =  "https://api.spotify.com/v1/playlists/"+playlistId+"/tracks?fields=items.track(name%2Cid%2Cartists.name)&limit=100&offset="+offset;
 


    var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer "+token);
myHeaders.append("Content-Type", "application/json");

var myInit = { method: 'GET',
             headers: myHeaders,
             mode: 'cors',
             cache: 'default' ,
           };


let response=await fetch(url,myInit);
if (!response.ok){
  return null
}
let json=await response.json();
console.log("downloadPlaylistData",json);

   let   newData=json['items'];
      if (newData.length === 0) {
        break;
      }
      result.push(...newData) ;
      offset += 100;
    }
  //response.body
  return result;

}

function buildIdsRequest( value,  begin,  end) {
  let result = value[begin]['track']['id'];

  for (let i = begin + 1; i < end; i++) {
    result += ',' + value[i]['track']['id'];
  }

  return result;
}

function artistsToString( artists) {
  let result = artists[0]['name'];

  for (let i = 1; i < artists.length; i++) {
    result += ', ' + artists[i]['name'];
  }

  return result;
}

async function extractTrackMetrics(token, value)  {
  let trackMetrics = [];
  console.log(typeof(value),value);
  for (let i = 0; i < value.length; i += 100) {
    var url = "https://api.spotify.com/v1/audio-features?ids=" +
        buildIdsRequest(value, i, Math.min(i + 100, value.length));


        var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer "+token);
myHeaders.append("Content-Type", "application/json");

var myInit = { method: 'GET',
             headers: myHeaders,
             mode: 'cors',
             cache: 'default' ,
           };

let features=(await (await fetch(url,myInit)).json())['audio_features'];




    for (let j = 0; j < features.length; j++) {
      features[j]['artist'] =
          artistsToString(value[j + i]['track']['artists']);
      features[j]['title'] = value[j + i]['track']['name'];
    }
    trackMetrics.push(...features);
  }
  return trackMetrics;
}


//extractTrackMetrics

async function loadPlaylist (value){



        let normalized=[];
        for (let i=0; i<value.length;i++){
          normalized[i]=[]
        }
      
      console.log(value)
      let metrics=["danceability","acousticness" ,"energy" ,"instrumentalness" ,"liveness" ,"loudness" ,"speechiness", "tempo", "valence"]
      //3ectxly6iUDCcr2woPUiMX
      let idx=0
      for (const metric in metrics){
        let mini=Number.MAX_VALUE;
        let maxi=Number.MIN_VALUE;
        for (let i=0; i<value.length;i++){
            let m=value[i][metrics[metric]]
            if (m<mini) {
              mini=m
            } else if (m>maxi) {
              maxi=m
            }
          normalized[i].push(m)
        }
        let alpha=maxi-mini;

        for (let i=0; i<value.length;i++){
          
        normalized[i][idx]=normalized[i][idx]/alpha;
      }

        idx++;
      }

      model.init({
        data: normalized,
        type: 'dense'
      })
      
      let [error, iter] = model.run();
      let outputScaled = model.getOutputScaled();
      for (const idx in outputScaled){
        outputScaled[idx][0]=(1+outputScaled[idx][0])*width/2;
        outputScaled[idx][1]=(1+outputScaled[idx][1])*height/2;
      }

      

      return outputScaled
    }

let model= new TSNE({
        dim: 2,
        perplexity: 30.0,
        earlyExaggeration: 4.0,
        learningRate: 100.0,
        nIter: 1000,
        metric: 'euclidean'
      });



function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

let width=1000;
let height=500;

function App() {

  const canvasRef=useRef(null);
  const contextRef=useRef(null);


  const [playlistid,setPlaylistid]=useState("");

  const [currentMusic,setcurrentMusic]=useState("");


  const [playlistLoading,setplaylistLoading]=useState(false);

  const [playlistSaving,setplaylistSaving]=useState(false);

  const [token,setToken]=useState("");

  const [tracks,setTracks]=useState([]);

  const [tsnedots,setTsnedots]=useState([]);
  const [tsneRemaining,settsneRemaining]=useState([]);
  const [playlistidxs,setPlaylistidxs]=useState([]);

  const [isDrawing,setIsDrawing]=useState(false);

    //      this.state.token= Cookies.get("spotifyAuthToken");

    useEffect(()=>{
      const canvas=canvasRef.current;
      canvas.width=width;
      canvas.height=height;

      const context=canvas.getContext("2d");
    //  context.lineCap="round";
      context.strokeStyle="black";
      context.lineWidth=3;
      contextRef.current=context;
    
    },[]);

    useEffect(() => {

      if (playlistLoading){
        (async  ()=>{
      let value=await  downloadPlaylistData(token,playlistid);
      if (value==null){
        setplaylistLoading(false);
        return
      }
      console.log("full",value)
      value= await extractTrackMetrics(token,value);
      setTracks(value);
      console.log('tracks',value)
      let tsnedots=await loadPlaylist(value);
        setTsnedots(tsnedots);

        let arr=[];
        for (let i = 0; i < tsnedots.length; i++) {
          arr[i] = true;
        }

        settsneRemaining(arr);
        setPlaylistidxs([]);
        
        
        
        setplaylistLoading(false);
        })();
      }
      

  }, [playlistLoading]);


  useEffect(() => {

    DrawDots();
    
}, [tsnedots]);
    

useEffect(() => {
  if (playlistSaving){
    (async ()=>{
  let playlist=[];
  for (let idx in playlistidxs){
    playlist.push(tracks[playlistidxs[idx]].uri)
  }
  
await savePlaylist(token,playlist);
setplaylistSaving(false);
  })();
}
  
}, [playlistSaving]);


       const MouseUpHandler=(event)=>{
          
          setIsDrawing(false)
        };

        const MouseDownHandler=(event)=>{
          setIsDrawing(true)

        };

        const MouseLeaveHandler=(event) =>{
          setIsDrawing(false)
          
        };


        const MouseMoveHandler=(event) =>{

          let pos=getMousePos(canvasRef.current,event);

          let nearestidx=null;
          let nearestdist=Number.MAX_VALUE;
          let dist;
          for (const idx in tsnedots){
             dist=  Math.pow(pos.x-tsnedots[idx][0],2)+Math.pow(pos.y-tsnedots[idx][1],2)
             if (dist<nearestdist){
               nearestdist=dist;
               nearestidx=idx;

             }
          }
          if (nearestdist<500){
            if (isDrawing && tsneRemaining[nearestidx]){
              tsneRemaining[nearestidx]=false
              playlistidxs.push(nearestidx)
           
              DrawLines();

            }
            setcurrentMusic(tracks[nearestidx].title+ " - "+tracks[nearestidx].artist)

          } else {
            setcurrentMusic("")
          }

          //find nearest
          //show name
          

          
        };

        const DrawLines=()=>{
          contextRef.current.beginPath();
          if (tsnedots.length>1){
          contextRef.current.moveTo(tsnedots[playlistidxs[0]][0],tsnedots[playlistidxs[0]][1]);
          for (let idx=1; idx<playlistidxs.length ; idx++) {
            
            contextRef.current.lineTo(tsnedots[playlistidxs[idx]][0], tsnedots[playlistidxs[idx]][1]);
            
          }
          contextRef.current.stroke();
        }

        };

        const DrawDots=()=>{
          console.log("DrawDots",tsnedots)
          contextRef.current.clearRect(0,0,width,height);
          for (const point in tsnedots) {
            contextRef.current.beginPath();
            contextRef.current.arc(tsnedots[point][0], tsnedots[point][1], 1, 0, 2 * Math.PI);
            contextRef.current.stroke();
          }

        };
     


  //3ectxly6iUDCcr2woPUiMX
 return (
    <div className='app' style={{
   //   display: 'flex',
  //    alignItems: 'center',
  //    justifyContent: 'center',
  }}>
      {token ? (
        <div>
                  <input type="text"  onChange={(e) =>setPlaylistid(e.target.value)} />
                  <input disabled={playlistLoading} type="button" value="Load playlist" onClick={()=>{
                    setplaylistLoading(true);                 
                  }
                    } />

                 

                    <input type="button" value="Clear"  onClick={() =>{

let arr=[];
        for (let i = 0; i < tsnedots.length; i++) {
          arr[i] = true;
        }

                      settsneRemaining(arr);
                      setPlaylistidxs([]);
                      DrawDots();
                    }
                      } />


                    <input disabled={playlistSaving} type="button" value="Save" onClick={
                      ()=>{
                        setplaylistSaving(true);

                      }
                    } ></input>
                   
                  <br/>
                    

        </div>
      ) : (
        // Display the login page
        <SpotifyAuth
        noCookie={true}
                    redirectUri='https://wd400.github.io/Spotify_t-sne_playlist/callback'
          clientID='abbc32cff69c46928a3b4e0bb7f43fab'
          scopes={[Scopes.playlistReadPrivate,Scopes.playlistModifyPrivate]}
          onAccessToken={(token) => setToken(token)}
        />
      )}
      <canvas 
                    ref={canvasRef}
                    onMouseUp={MouseUpHandler}
                    onMouseDown={MouseDownHandler}
                    onMouseLeave={MouseLeaveHandler}
                    onMouseMove={MouseMoveHandler}

                    
                    >Canvas</canvas>
                 
                  <br/>
                  {currentMusic}
                  
    </div>
  );
  

      }
    
export default App