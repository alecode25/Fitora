/**
 * FITORA - Logica di Nutrizione Professionale
 * Calcolo realistico basato sulla formula di Mifflin-St Jeor.
 */

const ACTIVITY_MULTIPLIERS = {
    sedentario: 1.2,      // Ufficio, poco movimento
    moderato: 1.375,    // Allenamento 1-3 volte a settimana
    attivo: 1.55,      // Allenamento 3-5 volte a settimana
    atleta: 1.725      // Allenamento intenso quotidiano
};

/**
 * Calcola il fabbisogno calorico e i macro in modo realistico.
 * 
 * @param {number} weight - Peso in kg
 * @param {number} height - Altezza in cm
 * @param {number} age - Età in anni
 * @param {string} gender - 'male' o 'female'
 * @param {string} activity - Chiave di ACTIVITY_MULTIPLIERS
 * @param {string} goal - 'lose' (dimagrimento), 'maintain' (mantenimento), 'gain' (massa)
 */
function calculateNutritionPlan(weight, height, age, gender, activity, goal) {
    // 1. Calcolo del BMR (Metabolismo Basale) - Mifflin-St Jeor
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += (gender === 'male' ? 5 : -161);

    // 2. Calcolo del TDEE (Fabbisogno calorico totale giornaliero)
    const multiplier = ACTIVITY_MULTIPLIERS[activity] || 1.2;
    const tdee = bmr * multiplier;

    // 3. Adeguamento in base all'obiettivo (Deficit o Surplus realistico)
    let targetCalories = tdee;
    if (goal === 'lose') {
        targetCalories = tdee - 500; // Deficit moderato di 500 kcal per una perdita sostenibile
    } else if (goal === 'gain') {
        targetCalories = tdee + 300; // Surplus controllato per minimizzare l'accumulo di grasso
    }

    // 4. Calcolo Macronutrienti (Approccio Fitness Realistico)
    
    // PROTEINE: 2.0g/kg. È il gold standard per chi si allena per mantenere la massa magra.
    const proteinGrams = weight * 2.0;
    const proteinCalories = proteinGrams * 4;

    // GRASSI: 0.8g/kg. Quantità ottimale per la salute ormonale e l'assorbimento delle vitamine.
    const fatGrams = weight * 0.8;
    const fatCalories = fatGrams * 9;

    // CARBOIDRATI: Il resto delle calorie viene assegnato ai carboidrati.
    let carbCalories = targetCalories - proteinCalories - fatCalories;
    
    // Sicurezza: se le calorie sono troppo basse, garantiamo almeno un minimo di carboidrati
    if (carbCalories < (targetCalories * 0.15)) {
        carbCalories = targetCalories * 0.15;
    }
    const carbGrams = carbCalories / 4;

    return {
        summary: {
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            totalCalories: Math.round(targetCalories)
        },
        macros: {
            protein: { grams: Math.round(proteinGrams), kcal: Math.round(proteinCalories), pct: Math.round((proteinCalories / targetCalories) * 100) },
            fats: { grams: Math.round(fatGrams), kcal: Math.round(fatCalories), pct: Math.round((fatCalories / targetCalories) * 100) },
            carbs: { grams: Math.round(carbGrams), kcal: Math.round(carbCalories), pct: Math.round((carbCalories / targetCalories) * 100) }
        }
    };
}

/**
 * Esempio di funzione da collegare alla UI di nutrition.html
 */
function updateNutritionDashboard() {
    // Esempio di acquisizione dati (da adattare ai tuoi ID in nutrition.html)
    const weight = parseFloat(document.getElementById('peso')?.value) || 70;
    const height = parseFloat(document.getElementById('altezza')?.value) || 170;
    const age = parseInt(document.getElementById('eta')?.value) || 25;
    const gender = document.querySelector('input[name="gender"]:checked')?.value || 'male';
    const activity = document.getElementById('activity-level')?.value || 'moderato';
    const goal = document.getElementById('fitness-goal')?.value || 'maintain';

    const plan = calculateNutritionPlan(weight, height, age, gender, activity, goal);

    // Aggiornamento DOM (Esempio)
    if (document.getElementById('kcal-target')) {
        document.getElementById('kcal-target').innerText = plan.summary.totalCalories;
        document.getElementById('prot-target').innerText = plan.macros.protein.grams + 'g';
        // ... ecc
    }
}