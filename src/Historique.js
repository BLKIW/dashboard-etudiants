import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { database, ref, onValue } from "./firebaseConfig";

function Historique() {
    const [historiqueMesures, setHistoriqueMesures] = useState([]);
    const [historiquePersonnes, setHistoriquePersonnes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // 📡 Récupérer les mesures de température & humidité
        const mesuresRef = ref(database, "/amesures");
        const unsubscribeMesures = onValue(mesuresRef, (snapshot) => {
            if (snapshot.exists()) {
                console.log("📡 Données Firebase (Mesures) :", snapshot.val());

                const mesures = snapshot.val();
                let mesuresArray = [];

                Object.keys(mesures).forEach((dateKey) => {
                    Object.keys(mesures[dateKey]).forEach((heureKey) => {
                        let data = mesures[dateKey][heureKey];

                        // Générer les solutions en fonction des mesures
                        let solutions = [];

                        if (data.temperature > 30) {
                            solutions.push("🔥 Température élevée, utilisez un ventilateur.");
                        } else if (data.temperature < 15) {
                            solutions.push("❄ Température trop basse, utilisez un chauffage.");
                        } else {
                            solutions.push("✅ Température confortable.");
                        }

                        if (data.humidity < 40) {
                            solutions.push("💦 Humidité basse, utilisez un humidificateur.");
                        } else if (data.humidity > 70) {
                            solutions.push("🌫 Humidité élevée, utilisez un déshumidificateur.");
                        } else {
                            solutions.push("✅ Humidité optimale.");
                        }

                        mesuresArray.push({
                            datetime: `${dateKey} ${heureKey}`,
                            temperature: data.temperature,
                            humidity: data.humidity,
                            solutions: solutions.join(" ") // Convertir en une seule chaîne de texte
                        });
                    });
                });

                // Trier par date décroissante
                mesuresArray.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

                setHistoriqueMesures(mesuresArray);
            } else {
                setHistoriqueMesures([]);
            }
        });

        // 📡 Récupérer l'historique des passages (entrées/sorties)
        const personnesRef = ref(database, "/historique");
        const unsubscribePersonnes = onValue(personnesRef, (snapshot) => {
            if (snapshot.exists()) {
                console.log("📡 Données Firebase (Personnes) :", snapshot.val());

                const passages = snapshot.val();
                let passagesArray = [];

                Object.keys(passages).forEach((dateKey) => {
                    Object.keys(passages[dateKey]).forEach((heureKey) => {
                        let data = passages[dateKey][heureKey];

                        passagesArray.push({
                            datetime: `${dateKey} ${heureKey}`,
                            event: data.event === "entrée" ? "🚶‍♂️ Entrée" : "🚪 Sortie",
                            count: data.count
                        });
                    });
                });

                // Trier par date décroissante
                passagesArray.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

                setHistoriquePersonnes(passagesArray);
            } else {
                setHistoriquePersonnes([]);
            }
        });

        return () => {
            unsubscribeMesures();
            unsubscribePersonnes();
        };
    }, []);

    return (
        <div className="container mt-5">
            <h1 className="text-center">📜 Historique</h1>

            <button className="btn btn-secondary mb-3" onClick={() => navigate("/")}>
                🏠 Retour au Dashboard
            </button>

            {/* Tableau des mesures */}
            <h2 className="mt-4">🌡️ Historique des mesures</h2>
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>📅 Date & Heure</th>
                            <th>🌡 Température (°C)</th>
                            <th>💧 Humidité (%)</th>
                            <th>🛠️ Solutions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historiqueMesures.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center">Aucune donnée disponible.</td>
                            </tr>
                        ) : (
                            historiqueMesures.map((entry, index) => (
                                <tr key={index}>
                                    <td>{entry.datetime}</td>
                                    <td>{entry.temperature}°C</td>
                                    <td>{entry.humidity}%</td>
                                    <td>{entry.solutions}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Tableau des entrées/sorties */}
            <h2 className="mt-4">🚪 Historique des passages</h2>
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>📅 Date & Heure</th>
                            <th>📍 Événement</th>
                            <th>👥 Nombre total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historiquePersonnes.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="text-center">Aucune donnée disponible.</td>
                            </tr>
                        ) : (
                            historiquePersonnes.map((entry, index) => (
                                <tr key={index}>
                                    <td>{entry.datetime}</td>
                                    <td>{entry.event}</td>
                                    <td>{entry.count}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Historique;
