import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";  // Import pour la navigation
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

function Dashboard() {
    const [data, setData] = useState({ temperature: 0, humidity: 0 });
    const [personnes, setPersonnes] = useState(0);
    const [historique, setHistorique] = useState([]);
    const [conditions, setConditions] = useState([]);
    const indexRef = useRef(0);
    const navigate = useNavigate(); // Permet de changer de page

    const today = new Date().toISOString().split("T")[0];
    useEffect(() => {
        const dataRef = ref(database, `/amesures/${today}`); // 🔹 Correction de l'interpolation
        indexRef.current = 0; // 🔹 Réinitialisation de l'index au montage
    
        const fetchData = async () => {
            try {
                const snapshot = await get(dataRef);
                if (snapshot.exists()) {
                    const mesures = snapshot.val();
                    const mesuresArray = Object.values(mesures);
    
                    if (indexRef.current < mesuresArray.length) {
                        const currentData = mesuresArray[indexRef.current];
                        setData(currentData);
    
                        setHistorique((prev) => [...prev.slice(-9), currentData]); // 🔹 Historique limité à 10 éléments
    
                        indexRef.current++;
                    }
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données :", error);
            }
        };
    
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, [today]); // 🔹 Ajout de `today` comme dépendance pour s'assurer que la mise à jour suit la date
    

    useEffect(() => {
        const personnesRef = ref(database, "/apersonnes");
        onValue(personnesRef, (snapshot) => {
            if (snapshot.exists()) {
                setPersonnes(snapshot.val());
            }
        });
    }, []);

    useEffect(() => {
        const newConditions = [];

        if (data.temperature > 30) {
            newConditions.push("🔥 Température élevée, utilisez un ventilateur.");
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

            {/* Bouton pour aller à l'historique */}
            <div className="text-center mt-4">
                <button className="btn btn-primary" onClick={() => navigate("/historique")}>
                    🔍 Voir l'historique
                </button>
            </div>
        </div>
    );
}

export default Dashboard;
