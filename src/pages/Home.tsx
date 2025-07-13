import AdTable from "../components/AdTable";
import { useAds } from "../services/AdsContext";
import '../css/Home.css';

function Home() {
    const { ads, loading, error } = useAds();

    // Show loading only on initial load (when there are no ads yet)
    if (loading && (!ads || ads.length === 0)) {
        return (
            <div className="home">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading ads...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="home">
                <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
                    Error loading ads: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="home">
            <AdTable ads={ads} />
        </div>
    );
}

export default Home;