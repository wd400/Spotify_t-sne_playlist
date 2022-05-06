import React from "react"
import Spotify from 'spotify-web-api-js';
import {Container, Row, Col} from 'react-bootstrap';
import "./App.css"

const SpotifyWebApi = new Spotify();
class Rdirect extends React.Component{
    constructor(){
        super();
        this.state={
            u_id:'',
            u_name:''
        }
        const params = this.getHashParams();
        if(params.access_token){
            SpotifyWebApi.setAccessToken(params.access_token)
        }
    }
    componentDidMount() {
        this.getUid();
    }
    getUid() {
        SpotifyWebApi.getMe()
            .then((response) => {
                this.setState({
                    u_id: response.id,
                    u_name:response.display_name
                })
                
            })
    }
    getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while ( e = r.exec(q)) {
           hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }
    
    render(){
        return(
            <Container fluid style={{marginTop:"10%"}}>
                <Row>
                    <Col className=" d-flex justify-content-center align-items-center">
                        <h2>User name:   {this.state.u_name}</h2>

                    </Col>
                </Row>
                <Row>
                    <Col className=" d-flex justify-content-center align-items-center">
                        <h2>User ID: {this.state.u_id}</h2>
                    </Col>
                </Row>
            </Container>
        )
    }
}
export default Rdirect;