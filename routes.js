/*
Purpose: For dynamic navigation between pages &
defining custome routes inside the application
For pages that has a token in the URL 
Documentation: https://github.com/fridays/next-routes
*/
// The second set of parentheses is to invoke the function returned from the import statement 


const routes = require ('next-routes')();

routes.add('/track/:address', 'track/show')
.add('/auctions/viewbales/:address','auctions/startAuction')
.add('/auctions/viewauctions/:address','auctions/joinAuction');
module.exports = routes; 


// Look at video 178 on how to do routing 