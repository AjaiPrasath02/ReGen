// Import Semantic UI CSS
import 'semantic-ui-css/semantic.min.css';

// Then import other styles
import { AuthProvider } from '../context/AuthContext';
import Layout from '../components/Layout';
import '../styles.css';
import '../styles/Visualization.css';
import '../styles/Carousel.css';
import '../styles/About.css';
import '../styles/login.css';

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