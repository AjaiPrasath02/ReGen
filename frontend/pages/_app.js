import 'semantic-ui-css/semantic.min.css';
import { AuthProvider } from '../context/AuthContext';
import Layout from '../components/Layout';
import '../styles.css';
import '../styles/Visualization.css';
import '../styles/Carousel.css';

function MyApp({ Component, pageProps }) {
    return (
        <AuthProvider>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </AuthProvider>
    );
}

export default MyApp;