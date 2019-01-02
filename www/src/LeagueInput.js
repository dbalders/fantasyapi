import React, { Component } from 'react';

export class LeagueInput extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {}

    render() {
        return (
            <input className="league-id-input" type="number" placeholder="40083" onKeyPress={this._handleKeyPress} />
        )
    }
}