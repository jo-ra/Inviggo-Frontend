// ad ce biti objekat koji sadrži podatke o oglasu
import '../css/AdCard.css';
function AdCard({ad}) {
    function onFavoriteClick() {
        alert("click")
    }
        // Logika za dodavan}je oglasa u favorite    
    return (
        <div className = "ad-card">
            <div className = "ad-picture">
                <img src={ad.imageUrl} alt={ad.title} />
                <div className="ad-overlay">
                    <button className="favorite-btn" onClick = {onFavoriteClick}> Click </button>
                </div>
            </div>
            <div className="ad-details">
                <h2 className="ad-title">{ad.title}</h2>
                <p className="ad-description">{ad.description}</p>
                <p className="ad-price">{ad.price} RSD</p>
            </div>
        </div>
    );
}

export default AdCard;