import AdTable from "../components/AdTable";
import { useState, useEffect } from "react";
import '../css/Home.css';

interface Ad {
    id: number;
    title: string;
    description: string;
    price: number;
    city: string;
    category: string;
    imageUrl: string;
    sellerName: string;
    sellerPhone: string;
}


function Home() {
    const [ads, setAds] = useState<Ad[]>([]);

    useEffect(() => {
        fetch('http://localhost:8080/ad/getAll')
            .then(res => res.json())
            .then(data => setAds(data.content ?? []))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="home">
            <AdTable ads={ads} />
        </div>
    );

}

export default Home;