import React, { Component } from 'react';
import { HomePage } from './HomePage';

export class EspnInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            espnId: 0
        }

        this._handleKeyPress = this._handleKeyPress.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {}

    _handleKeyPress = (e) => {
        //When they press enter
        if (e.key === 'Enter') {
            this.callApi('/api/espn/league/' + this.state.espnId)
                .then(results => {
                    //send the league ID over to the server to be added to database
                    //then send back to the home page for further processing
                    this.props.showEspnTeamInput(results, this.state.espnId);
                })
                .catch(err => {
                    console.log(err)
                    this.props.espnIdError(err.message);
                });
        }
    }

    handleChange(e) {
        this.setState({ espnId: e.target.value });
    }

    callApi = async (url) => {
        const response = await fetch(url);
        const body = await response.json();

        if (response.status !== 200) throw Error(body.messages);

        return body;
    };

    render() {
        return (
            <input className="espn-id-input" type="number" placeholder="65944212" onChange={this.handleChange} onKeyPress={this._handleKeyPress} />
        )
    }
}