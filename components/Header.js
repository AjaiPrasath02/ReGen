import React from 'react';
import { Menu } from 'semantic-ui-react';


import { Link } from '../routes';
export default () => {
    return (
        <div className="topMenu" style={{
            width: '100%',
            overflow: 'auto',
            whiteSpace: 'nowrap',
            backgroundColor: '#289672',
            marginBottom: '15px',
            textAlign: 'center' // Centering the content
        }}>
            <Link route='/' legacyBehavior>
                <a className='item' style={{'display': 'inline-block',
                'color': 'white',
                'font-family': 'Lato,\'Helvetica Neue\',Arial,Helvetica,sans-serif',
                'font-weight':'bold',
                'text-align': 'center',
                'padding': '14px',
                'text-decoration': 'none'}}>About</a>
            </Link>

            <Link route='/registration' legacyBehavior>
                <a className='item' style={{'display': 'inline-block',
                'color': 'white',
                'font-family': 'Lato,\'Helvetica Neue\',Arial,Helvetica,sans-serif',
                'font-weight':'bold',
                'text-align': 'center',
                'padding': '14px',
                'text-decoration': 'none'}}>Local Municipality</a>
            </Link>

            <Link route='/productionline' legacyBehavior>
                <a className='item' style={{'display': 'inline-block',
                'color': 'white',
                'font-family': 'Lato,\'Helvetica Neue\',Arial,Helvetica,sans-serif',
                'font-weight':'bold',
                'text-align': 'center',
                'padding': '14px',
                'text-decoration': 'none'}}>Production Line Machine</a>
            </Link>

            <Link route='/recycler' legacyBehavior>
                <a className='item' style={{'display': 'inline-block',
                'color': 'white',
                'font-family': 'Lato,\'Helvetica Neue\',Arial,Helvetica,sans-serif',
                'font-weight':'bold',
                'text-align': 'center',
                'padding': '14px',
                'text-decoration': 'none'}}>Recycler</a>
            </Link>

            <Link route='/auctions/viewbales' legacyBehavior>
                <a className='item' style={{'display': 'inline-block',
                'color': 'white',
                'font-family': 'Lato,\'Helvetica Neue\',Arial,Helvetica,sans-serif',
                'font-weight':'bold',
                'text-align': 'center',
                'padding': '14px',
                'text-decoration': 'none'}}>Seller</a>
            </Link>
            
            <Link route='/sortingmachine' legacyBehavior>
                <a className='item' style={{'display': 'inline-block',
                'color': 'white',
                'font-family': 'Lato,\'Helvetica Neue\',Arial,Helvetica,sans-serif',
                'font-weight':'bold',
                'text-align': 'center',
                'padding': '14px',
                'text-decoration': 'none'}}>Sorting Machine</a>
            </Link>

            <Link route='/auctions/viewauctions' legacyBehavior>
                <a className='item' style={{'display': 'inline-block',
                'color': 'white',
                'font-family': 'Lato,\'Helvetica Neue\',Arial,Helvetica,sans-serif',
                'font-weight':'bold',
                'text-align': 'center',
                'padding': '14px',
                'text-decoration': 'none'}}>Buyer</a>
            </Link>
        </div>
    );
}