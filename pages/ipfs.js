const IPFS = require('ipfs-http-client');
const ipfs = ipfsHttpClient({ host: 'localhost', port: '3000', protocol: 'http' });
export default ipfs;
