// Default values
let restaurantInfo = {
    name: "Gourmet Paradise",
    address: "123 Foodie Lane, Taste City, Yumland 45678"
};

function showInfo(type) {
    const content = document.getElementById('content');
    const map = document.getElementById('map');
    map.style.display = 'none';

    if (type === 'name') {
        content.innerHTML = `<strong>Restaurant Name:</strong> ${restaurantInfo.name}`;
    } else if (type === 'address') {
        content.innerHTML = `<strong>Address:</strong> ${restaurantInfo.address}`;
    }
}

function showMap() {
    const content = document.getElementById('content');
    const map = document.getElementById('map');
    content.innerHTML = '';
    map.style.display = 'block';
    map.src = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.835434509378!2d144.95592751531695!3d-37.817209979751294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf577ea46273e57c!2sMelbourne%20Central!5e0!3m2!1sen!2sau!4v1665996476786!5m2!1sen!2sau';
}

function editInfo(type) {
    let newValue;
    if (type === 'name') {
        newValue = prompt("Enter the new restaurant name:", restaurantInfo.name);
        if (newValue) restaurantInfo.name = newValue;
    } else if (type === 'address') {
        newValue = prompt("Enter the new address:", restaurantInfo.address);
        if (newValue) restaurantInfo.address = newValue;
    }
    alert("Information updated successfully!");
}

function saveData() {
    const dataToSave = JSON.stringify(restaurantInfo, null, 2);
    const blob = new Blob([dataToSave], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "restaurant_info.json";
    a.click();
    alert("Data saved successfully!");
}
