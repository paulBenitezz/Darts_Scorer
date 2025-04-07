let data = [];

async function fetchCSV(filePath) {
    const response = await fetch(filePath);
    const csvText = await response.text();
    return csvText;
}

function parseCSV(csvText) {
    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                resolve(results.data);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
}

async function loadCheckoutShots() {
    try {
        const csvFilePath = '/util/darts_checkout_shots.csv'; // Adjust the path as needed
        const csvText = await fetchCSV(csvFilePath);
        data = await parseCSV(csvText);
        console.log('Parsed CSV Data:', data);
        // You can now use the parsed data as needed
    } catch (error) {
        console.error('Error loading checkout shots:', error);
    }
}


function getCheckoutShot(playerScore, outShotLabel) {
    try {
        const checkoutShot = data.find((out) => {
            const score = parseInt(out.Out, 10);
            return score === playerScore;
        });
        console.log('New Checkout Shot:', checkoutShot);

        if (checkoutShot) {
            const darts = [checkoutShot.Dart1, checkoutShot.Dart2, checkoutShot.Dart3];
            const filteredDarts = darts.filter(dart => dart !== undefined && dart !== null);
            console.log('Filtered Darts:', filteredDarts);
            outShotLabel.textContent = filteredDarts.join(' - ');;
            console.log('Checkout Shot label:', outShotLabel.textContent);
        } else {
            outShotLabel.textContent = 'NO CHECKOUT SHOT';
        }
    } catch (error) {
        console.error('Error finding checkout shot:', error);
    }
}
// Call the function to load and parse the CSV file
loadCheckoutShots();

export { getCheckoutShot }