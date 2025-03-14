/*
import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { database, ref, onValue, get } from "./firebaseConfig";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
    const [data, setData] = useState({ temperature: 0, humidity: 0 });
    const [personnes, setPersonnes] = useState(0);
    const [historique, setHistorique] = useState([]);
    const [conditions, setConditions] = useState([]);
    const indexRef = useRef(0); // Stocker l'index sans être réinitialisé à chaque rendu

    useEffect(() => {
        const dataRef = ref(database, "/mesures");

        const fetchData = async () => {
            const snapshot = await get(dataRef);
            if (snapshot.exists()) {
                const mesures = snapshot.val();
                const mesuresArray = Object.values(mesures);

                if (indexRef.current < mesuresArray.length) {
                    const currentData = mesuresArray[indexRef.current];
                    setData(currentData);

                    setHistorique((prev) => [...prev.slice(-9), currentData]);

                    indexRef.current++;
                }
            }
        };

        // Exécuter fetchData toutes les 3 secondes
        const interval = setInterval(fetchData, 3000);

        return () => clearInterval(interval); // Nettoyage lors du démontage
    }, []);

    useEffect(() => {
        const personnesRef = ref(database, "/personnes");

        onValue(personnesRef, (snapshot) => {
            if (snapshot.exists()) {
                setPersonnes(snapshot.val());
            }
        });

    }, []);

    useEffect(() => {
        const newConditions = [];

        if (data.temperature > 30) {
            newConditions.push("🔥 Température élevée, utilisez un ventilateur ou baissez la température de la pièce.");
        } else if (data.temperature < 15) {
            newConditions.push("❄ Température trop basse, utilisez un chauffage.");
        } else {
            newConditions.push("✅ Température confortable.");
        }

        if (data.humidity < 40) {
            newConditions.push("💦 Humidité basse, utilisez un humidificateur.");
        } else if (data.humidity > 70) {
            newConditions.push("🌫 Humidité élevée, utilisez un déshumidificateur.");
        } else {
            newConditions.push("✅ Humidité optimale.");
        }
        
        if (personnes === 0) {
            newConditions.push("🏢 La salle est vide.");
        } else if (personnes <= 200) {
            newConditions.push("👥 Salle occupée, dans la limite.");
        } else {
            newConditions.push("🚨⚠ Capacité maximale atteinte !");
        }

        setConditions(newConditions);
    }, [data, personnes]);

    const chartData = {
        labels: historique.map((_, i) => `T-${historique.length - i}`),
        datasets: [
            {
                label: "Température (°C)",
                data: historique.map((d) => d.temperature),
                borderColor: "red",
                fill: false
            },
            {
                label: "Humidité (%)",
                data: historique.map((d) => d.humidity),
                borderColor: "blue",
                fill: false
            },
        ],
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">📊 Dashboard IOT</h1>

            <div className="row text-center my-4">
                <div className="col-md-4 p-3 border bg-light">
                    <h5>👥 Personnes dans la salle:</h5>
                    <strong>{personnes}</strong>
                </div>
                <div className="col-md-4 p-3 border bg-light">
                    <h5>🌡 Température:</h5>
                    <strong>{data.temperature}°C</strong>
                </div>
                <div className="col-md-4 p-3 border bg-light">
                    <h5>💧 Humidité:</h5>
                    <strong>{data.humidity}%</strong>
                </div>
            </div>

            <div className="alert alert-info text-center">
                <h5>⚡ Conditions en temps réel :</h5>
                <ul className="list-unstyled">
                    {conditions.map((condition, index) => (
                        <li key={index}>✅ {condition}</li>
                    ))}
                </ul>
            </div>

            <h3 className="text-center">📈 Évolution de la température et humidité</h3>
            <Line data={chartData} />
        </div>
    );
}

export default App;
*/
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Historique from "./Historique";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/historique" element={<Historique />} />
            </Routes>
        </Router>
    );
}

export default App;
