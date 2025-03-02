import React, { useState, useEffect } from "react";
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
import { database, ref, onValue } from "./firebaseConfig";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
    const [data, setData] = useState({ temperature: 0, humidity: 0 });
    const [personnes, setPersonnes] = useState(0);
    const [historique, setHistorique] = useState([]);
    const [conditions, setConditions] = useState([]);

    useEffect(() => {
        const dataRef = ref(database, "/mesures");
        let index = 0;

        const interval = setInterval(() => {
            onValue(dataRef, (snapshot) => {
                if (snapshot.exists()) {
                    const mesures = snapshot.val();
                    const mesuresArray = Object.values(mesures);

                    if (index < mesuresArray.length) {
                        const currentData = mesuresArray[index];
                        setData(currentData);
                        setHistorique((prev) => [...prev.slice(-9), currentData]);
                        index++;
                    }
                }
            });
        }, 6000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const personnesRef = ref(database, "/personnes");

        onValue(personnesRef, (snapshot) => {
            if (snapshot.exists()) {
                setPersonnes(snapshot.val());
            }
        });

    }, []);

    // Mise à jour des conditions en temps réel
    useEffect(() => {
        const newConditions = [];

        // Conditions de température
        if (data.temperature > 30) {
            newConditions.push("🔥 Température élevée, utilisez un ventilateur ou baissez la température de la pièce.");
        } else if (data.temperature < 15) {
            newConditions.push("❄ Température trop basse, utilisez un chauffage ou fermez les fenêtres pour retenir la chaleur.");
        } else {
            newConditions.push("✅ Température confortable, aucune action nécessaire.");
        }

        // Conditions d'humidité
        if (data.humidity < 40) {
            newConditions.push("💦 Humidité basse, humidifiez l'air avec un humidificateur ou ouvrez une fenêtre pour augmenter l'humidité.");
        } else if (data.humidity > 70) {
            newConditions.push("🌫 Humidité élevée, utilisez un déshumidificateur ou réduisez la ventilation pour assécher l'air.");
        } else {
            newConditions.push("✅ Humidité optimale, l'air est dans des conditions parfaites.");
        }
        
        // Conditions de présence
        if (personnes === 0) {
            newConditions.push("🏢 La salle est vide, vous pouvez l'utiliser pour d'autres activités.");
        } else if (personnes <= 200) {
            newConditions.push("👥 La salle est occupée, mais reste dans la limite de capacité. Aucun problème.");
        } else {
            newConditions.push("🚨⚠ Capacité maximale atteinte ! Veuillez gérer l'afflux de personnes et réajuster l'espace.");
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

            {/* Affichage des valeurs actuelles */}
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

            {/* Affichage des conditions en temps réel */}
            <div className="alert alert-info text-center">
                <h5>⚡ Conditions en temps réel :</h5>
                <ul className="list-unstyled">
                    {conditions.map((condition, index) => (
                        <li key={index}>✅ {condition}</li>
                    ))}
                </ul>
            </div>

            {/* Graphique de l'évolution des mesures */}
            <h3 className="text-center">📈 Évolution de la température et humidité</h3>
            <Line data={chartData} />
        </div>
    );
}

export default App;
