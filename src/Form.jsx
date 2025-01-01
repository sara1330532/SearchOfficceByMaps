import { useState, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { Marker, Popup } from 'react-leaflet';

const Form = () => {
    let [searchOfficee, setSearchOfficee] = useState({
        userName: "",
        searchAddress: "",
        phone: "",
        mail: "",
        isNet: false,
        isKitchen: false,
        isCoffee: false,
        numRooms: 0,
        distance: 0,
        status: "looking for"
    });
    //משתנה להצגת  אופציות הכתובות
    const [showDiv, setShowDiv] = useState(false);
    // משתנה להצגת המפה
    const [showMap, setShowMap] = useState(false);
    //מערך שלמירת אופציות לכתובת
    const [arrOptions, setArrOptions] = useState([]);

    // משתנה לשמירת הנקודות
    const [point, setPoint] = useState([]);
    // שמירת המיקום הנוכחי
    const [currentPosition, setCurrentPosition] = useState(null);
    // שמירת הודעת שגיאה, אם יש
    const [error, setError] = useState(null); 
    //---------------------------------------------
    //זוהי פונקציית השמירה של הנתונים
    const change = (e) => {
        //שליפת השדות
        const { name, type, value, checked } = e.target;
        let copy = { ...searchOfficee };
    
        // אם מדובר ב-checkbox, נעדכן את ה-state לפי ה-checked (מסומן או לא)
        if (type === "checkbox") {
            copy[name] = checked;  // עדכון הערך בהתאם למצב הסימון
        } else {
            // אם זה שדה אחר, פשוט נעדכן את ה-value
            copy[name] = value;
        }
    //  שמירה באובייקט בסטייט
        setSearchOfficee(copy);
    
        // טיפול בכתובת (חיפוש כתובת)
        if (name === "searchAddress" && type === "text") {
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${value}&limit=5`)
                .then(res => res.json())
                .then(data => {
                    if (data.length === 0) {
                        setArrOptions(["לא נמצא"]);
                        setShowDiv(true);
                    } else {
                       //שליפת המחרוזת של הכתובת
                        const str = data[0]?.display_name || "";
                        //חיתוך המחרוזת למערך
                        const options = str.split(",");
                        // שמירה במערך הכתובות בסטייט
                        setArrOptions(options);
                        //הצגת הכתובות האופציונליות בדיו
                        setShowDiv(true);
                        // הצגת המפה ע"פ המיקום שנבחר
                        setShowMap(false);
                    }
                })
                .catch(err => console.log(err));
        }
    };
    
    //----------------------------
    // פונקציה לקבלת הנקודות
    const latLon = (value) => {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${value}&limit=5`)
            .then(res => res.json())
            .then(data => {
                setPoint([data[0]?.lat, data[0]?.lon]); // מעדכן את הנקודה
                setShowMap(true); // מציג את המפה
            })
            .catch(err => console.log(err));
    };

    //-----------------------------------------------------------------------
    // טיפול בשמירת הכתובת שנבחרה מתוך רשימת האפשרויות
    const changeAddress = (e) => {
        //שליפת הערך
        const selectedAddress = e.target.value;
        // העתקה ועדכון באוביקט
        let copy = { ...searchOfficee };
        copy["searchAddress"] = selectedAddress;
        setSearchOfficee(copy);
        //הסתרת הדיו
        setShowDiv(false);
    };

    //----------------------------------------------------
    // פונקציה המקבלת נקודות ומציגה את המיקום במפה
    function MapWithPlaceholder(center) {
        return (
            <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: "600px", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={center}>
                    <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker>
            </MapContainer>
        )
    }
    //-------------------------------------------------------------------------
    // פונקציה לעדכון נקודות המיקום הנוכחי
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentPosition([latitude, longitude]); // עדכון המיקום
                },
                (err) => {
                    setError("לא הצלחנו לקבל את המיקום שלך: " + err.message);
                }
            );
        } else {
            setError("מיקום גיאוגרפי לא נתמך בדפדפן שלך");
        }
    }, []);
    // -------------------------------------------------------------
    // פונקציה להצגת המיקום הנוכחי
    function CurrentLocation() {
        return (
            <div style={{ height: "600px", width: "100%" }}>
                  <h3>המיקום הנוכחי שלך</h3>
                {error && <p style={{ color: "red" }}>{error}</p>}
                {currentPosition ? (
                    <MapContainer center={currentPosition} zoom={13} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={currentPosition}>
                            <Popup>המיקום הנוכחי שלך</Popup>
                        </Marker>
                    </MapContainer>
                ) : (
                    <p>טוען את המיקום שלך...</p>
                )}
            </div>
        )
    }

    return (
        <div className="container">
            <header className="header">
                <h1>ברוכים הבאים למערכת למציאת משרדים שיתופיים</h1>
                <p>
                    מצאו את המשרד השיתופי המושלם שמתאים בדיוק לצרכים שלכם,
                    עם כל מה שצריך כדי להרגיש בבית וליצור בגדול – החל מקפה טרי ועד חיבור אינטרנט מהיר. 
                    התחילו את החיפוש שלכם עכשיו 
                    ותנו לנו לעזור לכם למצוא את הסביבה האידיאלית לעבודה משותפת!
                </p>
            </header>
            <form className="formOffice">
                <input
                    type="text"
                    value={searchOfficee.userName}
                    name="userName"
                    placeholder="user name"
                    onChange={change}
                />
                <input
                    type="text"
                    value={searchOfficee.searchAddress}
                    name="searchAddress"
                    placeholder="search address"
                    onChange={change}
                />
             
                {showDiv && (
                    //כאן עןברים על מערך האופציות ועבור כ"א בניה של דיו להצגה והוספת פונקציות בעת לחיצה
                    <div className="hiddenDiv">
                   
                        {arrOptions.map((option, index) => (
                            <div
                                key={index}
                                onClick={() => {
                                    changeAddress({ target: { value: option } }); // מעדכן את הכתובת שנבחר
                                    latLon(option); // שולח את הכתובת שנבחרה ל-latLon
                                }}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                )}
                <input
                    type="text"
                    value={searchOfficee.phone}
                    name="phone"
                    placeholder="phone"
                    onChange={change}
                />
                <input
                    type="email"
                    value={searchOfficee.mail}
                    name="mail"
                    placeholder="mail"
                    onChange={change}
                />
                <label>
                    is net
                    <input
                        type="checkbox"
                        name="isNet"
                        checked={searchOfficee.isNet}
                        onChange={change}
                    />
                </label>
                <label>
                    is Kitchen
                    <input
                        type="checkbox"
                        name="isKitchen"
                        checked={searchOfficee.isKitchen}
                        onChange={change}
                    />
                </label>
                <label>
                    is Coffee
                    <input
                        type="checkbox"
                        name="isCoffee"
                        checked={searchOfficee.isCoffee}
                        onChange={change}
                    />
                </label>
                <label>Number of rooms:
                    <input
                        type="number"
                        value={searchOfficee.numRooms}
                        name="numRooms"
                        placeholder="Number of rooms"
                        onChange={change}
                    />
                </label>
                <label>Distance:
                    <input
                        type="number"
                        value={searchOfficee.distance}
                        name="distance"
                        placeholder="distance"
                        onChange={change}
                    />
                </label>
            </form>
          
            {/* מציג את המפה עם בחירת המשתמש */}
            {showMap && (
                MapWithPlaceholder(point)
            )}
            {/* שליחה לפונקציה להצגת המפה במיקום הנוכחי */}
            {!showMap && (
                CurrentLocation(currentPosition)
            )}
        </div>
    );
};

export default Form;
