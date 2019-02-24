import React, { Component } from "react";
import StripeCheckout from "react-stripe-checkout";
import axios from "axios";
import Cookies from 'js-cookie';

export class StripeBtn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            paid: false

        }
    }

    componentDidMount() {
        this.getPaid();
    }

    getPaid() {
        var paid = Cookies.get('paid');
        if (paid === 'true') {
            this.setState({ 'paid': true });
        }
    }

    render() {
        const publishableKey = "pk_test_J9A4W2CFQsPDfvmWJYDTCnAc";
        var body;

        const onToken = token => {
            var fantasyPlatform = Cookies.get('fantasyPlatform');
            if (fantasyPlatform === 'yahoo') {
                body = {
                    amount: 999,
                    token: token,
                    yahooEmail: Cookies.get('yahooEmail')
                };
            } else {
                body = {
                    amount: 999,
                    token: token,
                    espnLeagueId: Cookies.get('leagueId'),
                    espnTeamId: Cookies.get('teamId')
                };
            }
            
            axios
                .post("/api/payment", body)
                .then(response => {
                    this.setState({'paid': true})
                    alert("Payment Success");
                })
                .catch(error => {
                    alert("Payment Error");
                });
        };

        var returnHTML = <div className='hide'></div>;
        if (!this.state.paid) {
            returnHTML = <StripeCheckout
                label="Go Premium" //Component button text
                name="Business LLC" //Modal Header
                description="Upgrade to a premium account today."
                panelLabel="Go Premium" //Submit button in modal
                amount={999} //Amount in cents $9.99
                token={onToken}
                stripeKey={publishableKey}
                billingAddress={false}
            />
        }

        return returnHTML;
    };
}

export default { StripeBtn };