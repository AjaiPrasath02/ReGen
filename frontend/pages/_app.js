import { AuthProvider } from '../context/AuthContext';
import Layout from '../components/Layout';
import '../styles.css';
import '../styles/Visualization.css';
import '../styles/Carousel.css';

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);

  // List of pages that need Web3
  const web3Pages = ['/connect-wallet', '/dashboard', '/manufacturer', '/municipality'];
  
  // Only initialize Web3 on specific pages
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (!web3Pages.includes(currentPath)) {
      // Don't initialize Web3
      window.ethereum?.removeAllListeners();
    }
  }

  return (
    <AuthProvider>
      <Layout>
        {getLayout(<Component {...pageProps} />)}
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;