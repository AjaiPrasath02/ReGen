import React, { Component } from 'react';
import { Card, Button} from 'semantic-ui-react';
import web3 from '../../ethereum/web3';
import trackingContract from '../../ethereum/tracking';
import { Link } from '../../routes';
import Layout from '../../components/Layout';


class viewbales extends Component {
    constructor(props) {
        super(props);
        this.state = {
            plasticBaleAddr: '',
            productionTime: '',
            plasticBaleIPFS: '',
            cards: []

        };
    }

    componentDidMount = async () => {

        //1. Fetch data from event 
        const accounts = await web3.eth.getAccounts();
        //NOTE: Set the account back to account[0]
        trackingContract.events.plasticBaleCompleted({
            filter: { sellerAddress: accounts[0] }, fromBlock: 0
        }, function (error, event) {
            //Debugging 
            console.log(event); 
            //1. Fetch data from event 
            var time = new Date(event.returnValues['time'] * 1000);
            var date = time.toString(); 
            this.setState({
                plasticBaleAddr: event.returnValues['plasticbale'],
                productionTime: date,
                plasticBaleIPFS: event.returnValues['IPFSHash'],
            });

            //2. Render bale info to the page 
            this.renderBales();
            
        }.bind(this))
            .on('error', console.error);

    };

    
    handleClick = (address) => {

    };



    renderBales() {
        this.setState((prevState) => {
            const items = { image: this.state.plasticBaleIPFS, header: this.state.plasticBaleAddr, description:  `Production Time: ` + this.state.productionTime, fluid: true, extra:  
            <Button basic color='green' onClick={this.handleClick(this.state.plasticBaleAddr)}>
            Start Auction
            </Button> 
          };
            return { cards: [...prevState.cards, items] };
        });
    }

    render() {

        return (
            <Layout>
                <link rel="stylesheet"
                    href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css"
                />

                <div className='Seller'>

                    <h3>Plastic Bales produced at Your Facility</h3>
                    <Card.Group>
                        {this.state.cards.map(items => (
                            <Link route={`/auctions/viewbales/${items.header}`} legacyBehavior>
                                <Card 
                                image={`https://ipfs.io/ipfs/${items.image}`}
                                header={items.header}
                                description={items.description}
                                fluid={items.fluid} 
                                extra={items.extra}
                                
                                style={{
                                    'overflow': 'hidden'
                                }}
                                />

                            </Link>
                        ))}
                    </Card.Group>

                </div>
            </Layout>
        );
    }

}

export default viewbales; 