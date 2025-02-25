import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap pour le style
import { Line } from "react-chartjs-2"; // Importation du composant graphique
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js"; // Modules nécessaires pour Chart.js
import { database, ref, onValue } from "./firebaseConfig"; // Importation de Firebase

// Enregistrement des modules nécessaires pour Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
    // Déclaration des états
    const [data, setData] = useState({ temperature: 0, humidity: 0 }); // Stocke les dernières valeurs de température et humidité
    const [personnes, setPersonnes] = useState(0); // Stocke le nombre de personnes en temps réel
    const [historique, setHistorique] = useState([]); // Stocke l'historique des 10 dernières valeurs

    useEffect(() => {
        const dataRef = ref(database, "/mesures"); // Référence Firebase pour les mesures
        let index = 0; // Index pour naviguer dans les données

        // Met à jour les mesures (température & humidité) toutes les 6 secondes
        const interval = setInterval(() => {
            onValue(dataRef, (snapshot) => {
                if (snapshot.exists()) {
                    const mesures = snapshot.val();
                    const mesuresArray = Object.values(mesures);

                    if (index < mesuresArray.length) {
                        const currentData = mesuresArray[index];
                        setData(currentData); // Mise à jour des données actuelles
                        setHistorique((prev) => [...prev.slice(-9), currentData]); // Garde les 10 dernières valeurs
                        index++;
                    }
                }
            });
        }, 6000); // Mise à jour toutes les 6 secondes

        return () => clearInterval(interval); // Nettoyage de l'intervalle
    }, []);

    useEffect(() => {
        const personnesRef = ref(database, "/personnes"); // Référence Firebase pour le nombre de personnes

        // Met à jour le nombre de personnes en **temps réel**
        onValue(personnesRef, (snapshot) => {
            if (snapshot.exists()) {
                setPersonnes(snapshot.val());
            }
        });

    }, []); // Exécution une seule fois au montage

    // Configuration des données pour le graphique
    const chartData = {
        labels: historique.map((_, i) => `T-${historique.length - i}`), // Labels dynamiques
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

            {/* Graphique de l'évolution des mesures */}
            <h3 className="text-center">📈 Évolution de la température et humidité</h3>
            <Line data={chartData} />
        </div>
    );
}

export default App;
